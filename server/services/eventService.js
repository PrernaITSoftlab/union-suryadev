import { pool, inMemoryStore, saveRegistrationsBackup } from '../config/db.js';
import {
  ensureEventsSchemaAndSeed,
  normalizeEventRow,
  saveEventsToBackup,
  loadEventsFromBackup,
  saveRegistrationsToBackup,
  loadRegistrationsFromBackup,
  saveInteractionsToBackup,
  loadInteractionsFromBackup,
  formatDbDate
} from '../db/syncEventsDb.js';

// Auto-run schema check and initial sync on module load
let initialSyncPromise = ensureEventsSchemaAndSeed().then(loaded => {
  if (Array.isArray(loaded)) {
    inMemoryStore.events = [...loaded];
  }
}).catch(err => {
  console.warn('⚠️ Initial events sync notice:', err.message);
  const backup = loadEventsFromBackup();
  if (Array.isArray(backup)) {
    inMemoryStore.events = [...backup];
  }
});

// Track pending in-flight event creations to prevent race conditions on concurrent clicks
const pendingEventCreations = new Map();

export const EventService = {
  /**
   * Ensure startup sync has completed
   */
  async awaitInit() {
    try {
      await initialSyncPromise;
    } catch (_) { }
  },

  /**
   * Get all events with filters & optional enrichment for logged-in user
   */
  async getAllEvents({ status, search, type, isPublicOnly, userId } = {}) {
    await this.awaitInit();

    let eventsList = [];
    let dbSuccess = false;

    if (pool) {
      try {
        let queryText = `
          SELECT e.*,
            (SELECT COUNT(*)::int FROM event_likes WHERE event_id = e.id) AS likes_count,
            (SELECT COUNT(*)::int FROM event_comments WHERE event_id = e.id) AS comments_count
            ${userId ? `, (EXISTS(SELECT 1 FROM event_likes WHERE event_id = e.id AND user_id = ${Number(userId)})) AS is_liked` : ', false AS is_liked'}
          FROM events e
          WHERE 1=1
        `;
        const params = [];

        if (isPublicOnly) {
          queryText += ' AND (e.visibility IS NULL OR TRIM(e.visibility) = \'\' OR UPPER(e.visibility) IN (\'PUBLIC\', \'ALL\', \'GENERAL\'))';
        }

        if (status) {
          params.push(status.toUpperCase());
          queryText += ` AND UPPER(e.status) = $${params.length}`;
        }

        if (type) {
          params.push(type.toUpperCase());
          queryText += ` AND UPPER(e.event_type) = $${params.length}`;
        }

        if (search) {
          params.push(`%${search.toLowerCase()}%`);
          const idx = params.length;
          queryText += ` AND (LOWER(e.title) LIKE $${idx} OR LOWER(e.venue) LIKE $${idx} OR LOWER(e.description) LIKE $${idx})`;
        }

        queryText += ' ORDER BY e.start_date ASC, e.id ASC';

        const result = await pool.query(queryText, params);
        eventsList = result.rows.map(normalizeEventRow);
        dbSuccess = true;

        // Keep in-memory cache and backup updated with latest data from DB (clean of user-specific like flag)
        if (!status && !search && !type && !isPublicOnly) {
          inMemoryStore.events = eventsList.map(e => ({ ...e, is_liked: false }));
          saveEventsToBackup(inMemoryStore.events);
        }
      } catch (dbErr) {
        console.warn('⚠️ Error querying PostgreSQL events, falling back to cache:', dbErr.message);
        eventsList = [...inMemoryStore.events];
      }
    } else {
      eventsList = [...inMemoryStore.events];
    }

    // In-memory fallback filtering ONLY if DB query failed or pool is unavailable
    if (!dbSuccess && eventsList.length === 0 && inMemoryStore.events.length > 0) {
      eventsList = [...inMemoryStore.events];
    }

    if (isPublicOnly) {
      eventsList = eventsList.filter(e => !e.visibility || e.visibility.trim() === '' || ['PUBLIC', 'ALL', 'GENERAL'].includes(e.visibility.toUpperCase()));
    }
    if (status) {
      eventsList = eventsList.filter(e => e.status && e.status.toUpperCase() === status.toUpperCase());
    }
    if (type) {
      eventsList = eventsList.filter(e => e.event_type && e.event_type.toUpperCase() === type.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      eventsList = eventsList.filter(e =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Attach user registration status, likes and comments if needed
    const enriched = await Promise.all(eventsList.map(async (e) => {
      let userRegistration = null;
      if (userId) {
        userRegistration = await this.getUserRegistration(e.id, userId);
      }
      const likesCount = e.likes_count !== undefined ? Number(e.likes_count) : (inMemoryStore.eventLikes || []).filter(l => Number(l.event_id) === Number(e.id)).length;
      const commentsCount = e.comments_count !== undefined ? Number(e.comments_count) : (inMemoryStore.eventComments || []).filter(c => Number(c.event_id) === Number(e.id)).length;
      const isLiked = userId ? (Boolean(e.is_liked) || (inMemoryStore.eventLikes || []).some(l => Number(l.event_id) === Number(e.id) && Number(l.user_id) === Number(userId))) : false;

      return {
        ...e,
        likes_count: likesCount,
        comments_count: commentsCount,
        is_liked: isLiked,
        user_registration: userRegistration || null
      };
    }));

    return enriched;
  },

  /**
   * Get single event by ID
   */
  async getEventById(id, userId = null) {
    await this.awaitInit();
    const numId = Number(id);

    let event = null;

    if (pool) {
      try {
        const queryText = `
          SELECT e.*,
            (SELECT COUNT(*)::int FROM event_likes WHERE event_id = e.id) AS likes_count,
            (SELECT COUNT(*)::int FROM event_comments WHERE event_id = e.id) AS comments_count
            ${userId ? `, (EXISTS(SELECT 1 FROM event_likes WHERE event_id = e.id AND user_id = ${Number(userId)})) AS is_liked` : ', false AS is_liked'}
          FROM events e
          WHERE e.id = $1
        `;
        const res = await pool.query(queryText, [numId]);
        if (res.rows.length > 0) {
          event = normalizeEventRow(res.rows[0]);
        }
      } catch (err) {
        console.warn('⚠️ Error fetching event by ID from DB:', err.message);
      }
    }

    if (!event) {
      event = inMemoryStore.events.find(e => e.id === numId);
    }

    if (!event) return null;

    const likesCount = event.likes_count !== undefined ? Number(event.likes_count) : (inMemoryStore.eventLikes || []).filter(l => l.event_id === event.id).length;
    const commentsCount = event.comments_count !== undefined ? Number(event.comments_count) : (inMemoryStore.eventComments || []).filter(c => c.event_id === event.id).length;
    const isLiked = event.is_liked !== undefined ? Boolean(event.is_liked) : (userId ? (inMemoryStore.eventLikes || []).some(l => l.event_id === event.id && Number(l.user_id) === Number(userId)) : false);

    let userRegistration = null;
    if (userId) {
      userRegistration = await this.getUserRegistration(event.id, userId);
    }

    return {
      ...event,
      likes_count: likesCount,
      comments_count: commentsCount,
      is_liked: isLiked,
      user_registration: userRegistration || null
    };
  },

  /**
   * Create a new event
   */
  async createEvent(data, userId) {
    await this.awaitInit();

    const {
      title, description, banner_url, event_type, start_date, end_date,
      start_time, end_time, venue, address, capacity, registration_start_date,
      registration_end_date, is_paid, event_fee, payment_qr_url, payment_instructions,
      whatsapp_contact, visibility, status, requires_approval
    } = data;

    const defaultQr = inMemoryStore.systemSettings?.default_event_qr_url || "/images/payment-qr.png";
    const finalStartDate = formatDbDate(start_date || data.event_date || data.date) || new Date().toISOString().split('T')[0];
    const finalEndDate = formatDbDate(end_date || data.event_date || start_date || data.date) || finalStartDate;
    const finalStartTime = start_time || data.event_time || data.time || '10:00 AM';
    const finalEndTime = end_time || data.event_time_end || data.end_time || '05:00 PM';
    const finalFee = Number(event_fee !== undefined ? event_fee : (data.fee || 0)) || 0;
    const finalIsPaid = Boolean(is_paid) || finalFee > 0;
    const finalRequiresApproval = requires_approval !== undefined ? Boolean(requires_approval) : true;
    const finalVenue = (venue || data.location || 'Union Central Office').trim();
    const finalBanner = banner_url || data.image || data.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
    const finalRegStart = formatDbDate(registration_start_date || data.registration_start_date || start_date || data.event_date || data.date) || finalStartDate;
    const finalRegEnd = formatDbDate(registration_end_date || data.registration_end_date || end_date || data.event_date || start_date || data.date) || finalEndDate;

    // Deduplication check: if an identical event was created in the last 10 seconds, return it
    const trimmedTitle = (title || '').trim();
    const trimmedVenue = finalVenue;
    const dedupKey = `${trimmedTitle.toLowerCase()}__${finalStartDate}__${trimmedVenue.toLowerCase()}`;

    // 1. If an identical event creation is already in-flight, await and return its result
    if (trimmedTitle && pendingEventCreations.has(dedupKey)) {
      console.log(`⚠️ Deduplicating in-flight creation request for "${trimmedTitle}".`);
      return await pendingEventCreations.get(dedupKey);
    }

    const executeCreation = async () => {
      // 2. Deduplication check: if an identical event was created in the last 10 seconds, return it
      if (pool && trimmedTitle) {
        try {
          const dupCheck = await pool.query(
            `SELECT * FROM events 
             WHERE LOWER(TRIM(title)) = LOWER($1) 
               AND LOWER(TRIM(venue)) = LOWER($2) 
               AND created_at >= NOW() - INTERVAL '10 seconds'
             ORDER BY id DESC LIMIT 1`,
            [trimmedTitle, trimmedVenue]
          );
          if (dupCheck.rows.length > 0) {
            console.log(`⚠️ Prevented duplicate event creation for "${trimmedTitle}". Returning recently created event.`);
            return normalizeEventRow(dupCheck.rows[0]);
          }
        } catch (dupErr) {
          // Fallback to checking in-memory
        }
      }

      if (trimmedTitle) {
        const recentInMemory = (inMemoryStore.events || []).find(e => 
          e.title && e.title.trim().toLowerCase() === trimmedTitle.toLowerCase() &&
          e.venue && e.venue.trim().toLowerCase() === trimmedVenue.toLowerCase() &&
          (Date.now() - new Date(e.created_at || Date.now()).getTime()) < 10000
        );
        if (recentInMemory) {
          console.log(`⚠️ Prevented duplicate event creation for "${trimmedTitle}" (in-memory). Returning recently created event.`);
          return recentInMemory;
        }
      }

      let createdEvent = null;

      if (pool) {
        try {
          const queryText = `
            INSERT INTO events (
              title, description, banner_url, event_type, start_date, end_date,
              start_time, end_time, venue, address, capacity, registered_count,
              registration_start_date, registration_end_date, is_paid, event_fee,
              payment_qr_url, payment_instructions, whatsapp_contact, visibility,
              status, requires_approval, created_by, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6,
              $7, $8, $9, $10, $11, $12,
              $13, $14, $15, $16,
              $17, $18, $19, $20,
              $21, $22, $23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *;
          `;

          const values = [
            trimmedTitle,
            description || '',
            finalBanner,
            event_type || 'GENERAL',
            finalStartDate,
            finalEndDate,
            finalStartTime,
            finalEndTime,
            finalVenue,
            address || finalVenue,
            Number(capacity) || 500,
            0,
            finalRegStart,
            finalRegEnd,
            finalIsPaid,
            finalFee,
            payment_qr_url || defaultQr,
            payment_instructions || 'Pay fee using QR code and submit UTR number.',
            whatsapp_contact || inMemoryStore.systemSettings?.payment_whatsapp_number || '+91 94249 44041',
            visibility || 'PUBLIC',
            status || 'REGISTRATION_OPEN',
            finalRequiresApproval,
            userId || 1
          ];

          const res = await pool.query(queryText, values);
          if (res.rows.length > 0) {
            createdEvent = normalizeEventRow(res.rows[0]);
          }
        } catch (err) {
          console.error('❌ Error saving event to PostgreSQL:', err.message);
        }
      }

      if (!createdEvent) {
        // In-memory fallback
        createdEvent = {
          id: (inMemoryStore.events.reduce((max, e) => Math.max(max, e.id || 0), 0)) + 1,
          title: trimmedTitle,
          description: description || '',
          banner_url: finalBanner,
          image_url: finalBanner,
          event_type: event_type || 'GENERAL',
          start_date: finalStartDate,
          event_date: finalStartDate,
          end_date: finalEndDate,
          start_time: finalStartTime,
          event_time: finalStartTime,
          end_time: finalEndTime,
          venue: finalVenue,
          location: finalVenue,
          address: address || finalVenue,
          capacity: Number(capacity) || 500,
          registered_count: 0,
          registration_start_date: finalRegStart,
          registration_end_date: finalRegEnd,
          is_paid: finalIsPaid,
          event_fee: finalFee,
          requires_approval: finalRequiresApproval,
          payment_qr_url: payment_qr_url || defaultQr,
          payment_instructions: payment_instructions || 'Pay fee using QR code and submit UTR number.',
          whatsapp_contact: whatsapp_contact || inMemoryStore.systemSettings?.payment_whatsapp_number || '+91 94249 44041',
          visibility: visibility || 'PUBLIC',
          status: status || 'REGISTRATION_OPEN',
          created_by: userId || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Always update inMemoryStore and local backup
      inMemoryStore.events.unshift(createdEvent);
      saveEventsToBackup(inMemoryStore.events);

      return createdEvent;
    };

    const creationPromise = executeCreation();
    if (trimmedTitle) {
      pendingEventCreations.set(dedupKey, creationPromise);
    }

    try {
      const result = await creationPromise;
      setTimeout(() => {
        pendingEventCreations.delete(dedupKey);
      }, 5000);
      return result;
    } catch (err) {
      pendingEventCreations.delete(dedupKey);
      throw err;
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(id, updates) {
    await this.awaitInit();
    const numId = Number(id);

    let updatedEvent = null;

    if (pool) {
      try {
        // Fetch current event row first
        const currentRes = await pool.query('SELECT * FROM events WHERE id = $1', [numId]);
        if (currentRes.rows.length === 0) {
          return null;
        }

        const curr = currentRes.rows[0];

        const title = updates.title !== undefined ? String(updates.title).trim() : curr.title;
        const description = updates.description !== undefined ? updates.description : curr.description;
        const banner_url = updates.banner_url !== undefined ? updates.banner_url : curr.banner_url;
        const event_type = updates.event_type !== undefined ? updates.event_type : curr.event_type;
        const start_date = formatDbDate(updates.start_date !== undefined ? updates.start_date : curr.start_date);
        const end_date = formatDbDate(updates.end_date !== undefined ? updates.end_date : curr.end_date) || start_date;
        const start_time = updates.start_time !== undefined ? updates.start_time : curr.start_time;
        const end_time = updates.end_time !== undefined ? updates.end_time : curr.end_time;
        const venue = updates.venue !== undefined ? String(updates.venue).trim() : curr.venue;
        const address = updates.address !== undefined ? updates.address : curr.address;
        const capacity = updates.capacity !== undefined ? Number(updates.capacity) : curr.capacity;
        const registration_start_date = formatDbDate(updates.registration_start_date !== undefined ? updates.registration_start_date : curr.registration_start_date) || start_date;
        const registration_end_date = formatDbDate(updates.registration_end_date !== undefined ? updates.registration_end_date : curr.registration_end_date) || start_date;
        const event_fee = updates.event_fee !== undefined ? Number(updates.event_fee) : Number(curr.event_fee || 0);
        const is_paid = updates.is_paid !== undefined ? Boolean(updates.is_paid) : (event_fee > 0 ? true : Boolean(curr.is_paid));
        const requires_approval = updates.requires_approval !== undefined ? Boolean(updates.requires_approval) : (curr.requires_approval !== undefined ? Boolean(curr.requires_approval) : true);
        const payment_qr_url = updates.payment_qr_url !== undefined ? updates.payment_qr_url : curr.payment_qr_url;
        const payment_instructions = updates.payment_instructions !== undefined ? updates.payment_instructions : curr.payment_instructions;
        const whatsapp_contact = updates.whatsapp_contact !== undefined ? updates.whatsapp_contact : curr.whatsapp_contact;
        const visibility = updates.visibility !== undefined ? updates.visibility : (curr.visibility || 'PUBLIC');
        const status = updates.status !== undefined ? updates.status : curr.status;

        const updateQuery = `
          UPDATE events SET
            title = $1,
            description = $2,
            banner_url = $3,
            event_type = $4,
            start_date = $5,
            end_date = $6,
            start_time = $7,
            end_time = $8,
            venue = $9,
            address = $10,
            capacity = $11,
            registration_start_date = $12,
            registration_end_date = $13,
            is_paid = $14,
            event_fee = $15,
            payment_qr_url = $16,
            payment_instructions = $17,
            whatsapp_contact = $18,
            visibility = $19,
            status = $20,
            requires_approval = $21,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $22
          RETURNING *;
        `;

        const res = await pool.query(updateQuery, [
          title, description, banner_url, event_type, start_date, end_date,
          start_time, end_time, venue, address, capacity, registration_start_date,
          registration_end_date, is_paid, event_fee, payment_qr_url, payment_instructions,
          whatsapp_contact, visibility, status, requires_approval, numId
        ]);

        if (res.rows.length > 0) {
          updatedEvent = normalizeEventRow(res.rows[0]);
        }
      } catch (err) {
        console.error('❌ Error updating event in PostgreSQL:', err.message);
      }
    }

    // In-memory update & sync
    const memIndex = inMemoryStore.events.findIndex(e => e.id === numId);
    if (memIndex !== -1) {
      if (updatedEvent) {
        inMemoryStore.events[memIndex] = updatedEvent;
      } else {
        const finalFee = updates.event_fee !== undefined ? Number(updates.event_fee) : Number(inMemoryStore.events[memIndex].event_fee || 0);
        const finalPaid = updates.is_paid !== undefined ? Boolean(updates.is_paid) : (finalFee > 0);
        Object.assign(inMemoryStore.events[memIndex], updates, {
          event_fee: finalFee,
          is_paid: finalPaid,
          requires_approval: updates.requires_approval !== undefined ? Boolean(updates.requires_approval) : (inMemoryStore.events[memIndex].requires_approval !== undefined ? inMemoryStore.events[memIndex].requires_approval : true),
          updated_at: new Date().toISOString(),
          visibility: updates.visibility || inMemoryStore.events[memIndex].visibility || 'PUBLIC'
        });
        updatedEvent = inMemoryStore.events[memIndex];
      }
    } else if (updatedEvent) {
      inMemoryStore.events.unshift(updatedEvent);
    }

    saveEventsToBackup(inMemoryStore.events);
    return updatedEvent;
  },

  /**
   * Delete an event by ID permanently from database and cache
   */
  async deleteEvent(id) {
    await this.awaitInit();
    const numId = Number(id);
    if (!numId || isNaN(numId)) {
      throw new Error(`Invalid event ID: ${id}`);
    }

    let deletedEvent = null;

    if (pool) {
      try {
        // Disassociate any payments referencing registrations for this event to avoid FK constraint errors
        await pool.query(
          `UPDATE payments SET event_registration_id = NULL 
           WHERE event_registration_id IN (SELECT id FROM event_registrations WHERE event_id = $1)`,
          [numId]
        );

        // Cascade delete child likes, comments, and registrations
        await pool.query('DELETE FROM event_likes WHERE event_id = $1', [numId]);
        await pool.query('DELETE FROM event_comments WHERE event_id = $1', [numId]);
        await pool.query('DELETE FROM event_registrations WHERE event_id = $1', [numId]);

        // Permanently delete event from PostgreSQL
        const res = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [numId]);
        if (res.rows.length > 0) {
          deletedEvent = normalizeEventRow(res.rows[0]);
        }
      } catch (err) {
        console.error('❌ Error deleting event from PostgreSQL:', err.message);
        throw new Error(`Failed to delete event from database: ${err.message}`);
      }
    }

    // Always clean up inMemoryStore events
    const memIndex = inMemoryStore.events.findIndex(e => Number(e.id) === numId);
    if (memIndex !== -1) {
      const spliced = inMemoryStore.events.splice(memIndex, 1)[0];
      if (!deletedEvent) deletedEvent = spliced;
    }
    inMemoryStore.events = (inMemoryStore.events || []).filter(e => Number(e.id) !== numId);

    // Clean up in-memory registrations, likes, comments, and payments
    const targetRegIds = (inMemoryStore.eventRegistrations || [])
      .filter(r => Number(r.event_id) === numId)
      .map(r => Number(r.id));

    inMemoryStore.eventRegistrations = (inMemoryStore.eventRegistrations || []).filter(r => Number(r.event_id) !== numId);
    inMemoryStore.eventLikes = (inMemoryStore.eventLikes || []).filter(l => Number(l.event_id) !== numId);
    inMemoryStore.eventComments = (inMemoryStore.eventComments || []).filter(c => Number(c.event_id) !== numId);
    inMemoryStore.payments = (inMemoryStore.payments || []).map(p =>
      targetRegIds.includes(Number(p.event_registration_id)) ? { ...p, event_registration_id: null } : p
    );

    // If pool is connected, re-sync inMemoryStore.events with the current database state
    if (pool) {
      try {
        const remaining = await pool.query(`
          SELECT e.*,
            (SELECT COUNT(*)::int FROM event_likes WHERE event_id = e.id) AS likes_count,
            (SELECT COUNT(*)::int FROM event_comments WHERE event_id = e.id) AS comments_count,
            false AS is_liked
          FROM events e
          ORDER BY e.start_date ASC, e.id ASC
        `);
        inMemoryStore.events = remaining.rows.map(normalizeEventRow);
      } catch (syncErr) {
        console.warn('⚠️ Notice syncing remaining events after deletion:', syncErr.message);
      }
    }

    // Persist clean state to disk backup immediately
    saveEventsToBackup(inMemoryStore.events);
    saveRegistrationsToBackup(inMemoryStore.eventRegistrations);
    saveInteractionsToBackup({
      likes: inMemoryStore.eventLikes,
      comments: inMemoryStore.eventComments
    });

    return deletedEvent || { id: numId, title: 'Event' };
  },

  /**
   * Register a user for an event (Member submits a Join Request)
   */
  async registerForEvent(eventId, user, regData) {
    await this.awaitInit();
    const numEventId = Number(eventId);
    const userId = Number(user.id);

    const event = await this.getEventById(numEventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
      throw new Error('Registrations are closed for this event.');
    }

    const isPaidEvent = Boolean(event.is_paid && Number(event.event_fee) > 0);
    const { transaction_id, payment_proof_url } = regData || {};

    if (isPaidEvent) {
      if (!transaction_id || !transaction_id.trim()) {
        throw new Error('Payment Transaction ID / UTR number is required for paid events.');
      }
      if (!payment_proof_url || !payment_proof_url.trim()) {
        throw new Error('Payment receipt upload is required for paid events. Please upload your payment receipt screenshot or PDF.');
      }
    }

    // Check duplicate or prior rejected application
    const existing = await this.getUserRegistration(numEventId, userId);
    if (existing) {
      if (existing.registration_status !== 'REJECTED' && existing.registration_status !== 'CANCELLED') {
        const err = new Error(
          existing.registration_status === 'PENDING'
            ? 'Your join request for this event is already submitted and pending admin approval.'
            : 'You have already joined this event.'
        );
        err.existing = existing;
        throw err;
      }
    }

    const pass_code = existing?.pass_code || `PASS-${(event.title || 'EVT').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const registrationStatus = 'PENDING'; // Member requests to join -> admin will approve or reject
    const paymentStatus = isPaidEvent ? 'PAYMENT_PENDING' : 'CONFIRMED';
    const amount = isPaidEvent ? Number(event.event_fee) : 0;

    let newReg = null;

    if (pool) {
      try {
        if (existing) {
          // Update existing rejected/cancelled registration back to PENDING
          const updateQuery = `
            UPDATE event_registrations
            SET amount = $1, payment_status = $2, registration_status = $3,
                transaction_id = $4, payment_proof_url = $5, rejection_reason = NULL, registered_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *;
          `;
          const res = await pool.query(updateQuery, [
            amount, paymentStatus, registrationStatus,
            transaction_id || '', payment_proof_url || '', existing.id
          ]);
          if (res.rows.length > 0) newReg = res.rows[0];
        } else {
          const insertReg = `
            INSERT INTO event_registrations (
              event_id, user_id, pass_code, amount, payment_status,
              registration_status, transaction_id, payment_proof_url, rejection_reason, registered_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, CURRENT_TIMESTAMP)
            RETURNING *;
          `;
          const regRes = await pool.query(insertReg, [
            numEventId, userId, pass_code, amount,
            paymentStatus, registrationStatus, transaction_id || '',
            payment_proof_url || ''
          ]);

          if (regRes.rows.length > 0) {
            newReg = regRes.rows[0];
          }
        }

        if (newReg) {
          newReg.id = Number(newReg.id);
          newReg.event_id = Number(newReg.event_id);
          newReg.user_id = Number(newReg.user_id);
          newReg.amount = Number(newReg.amount || 0);
        }
      } catch (dbErr) {
        console.error('❌ Error saving registration to PostgreSQL:', dbErr.message);
      }
    }

    if (!newReg) {
      if (existing) {
        existing.amount = amount;
        existing.payment_status = paymentStatus;
        existing.registration_status = registrationStatus;
        existing.transaction_id = transaction_id || '';
        existing.payment_proof_url = payment_proof_url || '';
        existing.rejection_reason = '';
        existing.registered_at = new Date().toISOString();
        newReg = existing;
      } else {
        newReg = {
          id: inMemoryStore.eventRegistrations.length + 1,
          event_id: numEventId,
          user_id: userId,
          pass_code,
          amount,
          payment_status: paymentStatus,
          registration_status: registrationStatus,
          transaction_id: transaction_id || '',
          payment_proof_url: payment_proof_url || '',
          rejection_reason: '',
          registered_at: new Date().toISOString()
        };
        inMemoryStore.eventRegistrations.unshift(newReg);
      }
    } else if (!existing) {
      inMemoryStore.eventRegistrations.unshift(newReg);
    }

    // Save registrations to backup disk file immediately
    saveRegistrationsBackup();
    saveRegistrationsToBackup(inMemoryStore.eventRegistrations);

    // Record payment if paid
    if (isPaidEvent && transaction_id) {
      const paymentItem = {
        id: inMemoryStore.payments.length + 1,
        user_id: userId,
        membership_application_id: null,
        event_registration_id: newReg.id,
        payment_type: 'EVENT',
        amount: event.event_fee,
        transaction_id: transaction_id.trim(),
        payment_proof_url: payment_proof_url || '',
        payment_date: new Date().toISOString().split('T')[0],
        status: 'SUBMITTED',
        verified_by: null,
        verified_at: null,
        remarks: `Event registration fee for ${event.title}`,
        created_at: new Date().toISOString()
      };

      if (pool) {
        try {
          await pool.query(`
            INSERT INTO payments (
              user_id, membership_application_id, event_registration_id, payment_type,
              amount, transaction_id, payment_proof_url, payment_date, status, remarks
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            userId, null, newReg.id, 'EVENT', event.event_fee,
            transaction_id.trim(), payment_proof_url || '',
            paymentItem.payment_date, 'SUBMITTED', paymentItem.remarks
          ]);
        } catch (payErr) {
          console.warn('⚠️ Notice on saving payment to PostgreSQL:', payErr.message);
        }
      }

      inMemoryStore.payments.unshift(paymentItem);
    }

    // Notify Administrator of new Join Request
    inMemoryStore.notifications.unshift({
      id: inMemoryStore.notifications.length + 1,
      user_id: 1,
      title: 'New Event Join Request',
      message: `${user?.profile?.full_name || user?.email || 'A union member'} submitted a request to join "${event.title}".`,
      type: 'EVENT',
      is_read: false,
      created_at: new Date().toISOString()
    });

    saveEventsToBackup(inMemoryStore.events);
    return newReg;
  },

  /**
   * Admin Approve Event Join Request
   */
  async approveRegistration(registrationId, adminUser) {
    await this.awaitInit();
    const numRegId = Number(registrationId);

    let reg = null;

    if (pool) {
      try {
        const res = await pool.query(`
          UPDATE event_registrations
          SET registration_status = 'CONFIRMED',
              payment_status = 'CONFIRMED',
              rejection_reason = NULL
          WHERE id = $1
          RETURNING *;
        `, [numRegId]);

        if (res.rows.length > 0) {
          reg = res.rows[0];
          reg.id = Number(reg.id);
          reg.event_id = Number(reg.event_id);
          reg.user_id = Number(reg.user_id);

          // Update event registered_count in DB
          await pool.query('UPDATE events SET registered_count = registered_count + 1 WHERE id = $1', [reg.event_id]);
          
          // Also update payment record if exists
          await pool.query(`
            UPDATE payments 
            SET status = 'VERIFIED', verified_by = $1, verified_at = CURRENT_TIMESTAMP
            WHERE event_registration_id = $2
          `, [adminUser?.id || 1, numRegId]);
        }
      } catch (err) {
        console.error('❌ Error approving registration in PostgreSQL:', err.message);
      }
    }

    // Update in-memory store
    const memReg = inMemoryStore.eventRegistrations.find(r => r.id === numRegId);
    if (memReg) {
      memReg.registration_status = 'CONFIRMED';
      memReg.payment_status = 'CONFIRMED';
      memReg.rejection_reason = '';
      if (!reg) reg = memReg;
    }

    const eventId = reg?.event_id || memReg?.event_id;
    const targetEvent = inMemoryStore.events.find(e => e.id === Number(eventId));
    if (targetEvent) {
      targetEvent.registered_count = (targetEvent.registered_count || 0) + 1;
    }

    // Update payment in memory if exists
    const memPayment = inMemoryStore.payments.find(p => p.event_registration_id === numRegId);
    if (memPayment) {
      memPayment.status = 'VERIFIED';
      memPayment.verified_by = adminUser?.id || 1;
      memPayment.verified_at = new Date().toISOString();
    }

    // Send member notification
    const userId = reg?.user_id || memReg?.user_id;
    if (userId) {
      inMemoryStore.notifications.unshift({
        id: inMemoryStore.notifications.length + 1,
        user_id: Number(userId),
        title: 'Event Join Request Approved! 🎉',
        message: `Your request to join "${targetEvent?.title || 'the event'}" has been approved! Your pass code is ${reg?.pass_code || memReg?.pass_code}. You are now authorized to attend this event.`,
        type: 'EVENT',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Add Audit Log
    inMemoryStore.auditLogs.unshift({
      id: inMemoryStore.auditLogs.length + 1,
      action: 'EVENT_REGISTRATION_APPROVED',
      actor_id: adminUser?.id || 1,
      actor_name: adminUser?.profile?.full_name || 'Admin',
      entity_type: 'EVENT_REGISTRATION',
      entity_id: String(numRegId),
      details: `Approved join request for event "${targetEvent?.title || 'Event'}" (Pass: ${reg?.pass_code || memReg?.pass_code})`,
      created_at: new Date().toISOString()
    });

    saveEventsToBackup(inMemoryStore.events);
    saveRegistrationsBackup();
    saveRegistrationsToBackup(inMemoryStore.eventRegistrations);
    return reg || memReg;
  },

  /**
   * Admin Reject Event Join Request
   */
  async rejectRegistration(registrationId, adminUser, rejectionReason = '') {
    await this.awaitInit();
    const numRegId = Number(registrationId);

    let reg = null;

    if (pool) {
      try {
        const res = await pool.query(`
          UPDATE event_registrations
          SET registration_status = 'REJECTED',
              payment_status = 'REJECTED',
              rejection_reason = $1
          WHERE id = $2
          RETURNING *;
        `, [rejectionReason || 'Registration request rejected by admin.', numRegId]);

        if (res.rows.length > 0) {
          reg = res.rows[0];
          reg.id = Number(reg.id);
          reg.event_id = Number(reg.event_id);
          reg.user_id = Number(reg.user_id);

          // Update payment record if exists
          await pool.query(`
            UPDATE payments 
            SET status = 'REJECTED', remarks = $1
            WHERE event_registration_id = $2
          `, [rejectionReason || 'Registration request rejected by admin.', numRegId]);
        }
      } catch (err) {
        console.error('❌ Error rejecting registration in PostgreSQL:', err.message);
      }
    }

    // Update in-memory store
    const memReg = inMemoryStore.eventRegistrations.find(r => r.id === numRegId);
    const wasConfirmed = memReg?.registration_status === 'CONFIRMED';
    if (memReg) {
      memReg.registration_status = 'REJECTED';
      memReg.payment_status = 'REJECTED';
      memReg.rejection_reason = rejectionReason || 'Registration request rejected by admin.';
      if (!reg) reg = memReg;
    }

    const eventId = reg?.event_id || memReg?.event_id;
    const targetEvent = inMemoryStore.events.find(e => e.id === Number(eventId));
    if (targetEvent && wasConfirmed && targetEvent.registered_count > 0) {
      targetEvent.registered_count -= 1;
      if (pool) {
        try {
          await pool.query('UPDATE events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = $1', [targetEvent.id]);
        } catch (_) {}
      }
    }

    // Update payment in memory if exists
    const memPayment = inMemoryStore.payments.find(p => p.event_registration_id === numRegId);
    if (memPayment) {
      memPayment.status = 'REJECTED';
      memPayment.remarks = rejectionReason || 'Registration request rejected by admin.';
    }

    // Send member notification
    const userId = reg?.user_id || memReg?.user_id;
    if (userId) {
      inMemoryStore.notifications.unshift({
        id: inMemoryStore.notifications.length + 1,
        user_id: Number(userId),
        title: 'Event Join Request Update',
        message: `Your request to join "${targetEvent?.title || 'the event'}" was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''} Only approved members can attend this event.`,
        type: 'EVENT',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Add Audit Log
    inMemoryStore.auditLogs.unshift({
      id: inMemoryStore.auditLogs.length + 1,
      action: 'EVENT_REGISTRATION_REJECTED',
      actor_id: adminUser?.id || 1,
      actor_name: adminUser?.profile?.full_name || 'Admin',
      entity_type: 'EVENT_REGISTRATION',
      entity_id: String(numRegId),
      details: `Rejected join request for event "${targetEvent?.title || 'Event'}". ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      created_at: new Date().toISOString()
    });

    saveEventsToBackup(inMemoryStore.events);
    saveRegistrationsBackup();
    saveRegistrationsToBackup(inMemoryStore.eventRegistrations);
    return reg || memReg;
  },

  /**
   * Get all event registrations for a specific logged-in member
   */
  async getMyRegistrations(userId) {
    await this.awaitInit();
    const numUserId = Number(userId);
    let list = [];

    if (pool) {
      try {
        const res = await pool.query(`
          SELECT 
            r.*,
            e.title AS event_title,
            e.start_date AS event_date,
            e.start_time AS event_time,
            e.end_date AS event_end_date,
            e.venue AS event_venue,
            e.event_fee,
            e.is_paid AS event_is_paid,
            e.banner_url AS event_banner,
            e.event_type,
            e.status AS event_status
          FROM event_registrations r
          LEFT JOIN events e ON r.event_id = e.id
          WHERE r.user_id = $1
          ORDER BY r.registered_at DESC;
        `, [numUserId]);

        if (res.rows.length > 0) {
          list = res.rows.map(r => ({
            ...r,
            id: Number(r.id),
            event_id: Number(r.event_id),
            user_id: Number(r.user_id),
            amount: Number(r.amount || 0),
            event_fee: Number(r.event_fee || 0),
            event_title: r.event_title || 'Union Event',
            event_date: r.event_date ? String(r.event_date).slice(0, 10) : '',
            event_time: r.event_time || '10:00 AM',
            event_venue: r.event_venue || 'Indore HQ',
            event_banner: r.event_banner || '',
            is_paid: Boolean(r.event_is_paid || r.amount > 0),
            can_attend: r.registration_status === 'CONFIRMED'
          }));
        }
      } catch (err) {
        console.warn('⚠️ Error fetching member registrations from PostgreSQL:', err.message);
      }
    }

    if (list.length === 0) {
      const userRegs = inMemoryStore.eventRegistrations.filter(r => Number(r.user_id) === numUserId);
      list = userRegs.map(r => {
        const targetEvent = inMemoryStore.events.find(e => Number(e.id) === Number(r.event_id));
        return {
          ...r,
          event_title: targetEvent?.title || 'Union Event',
          event_date: targetEvent?.start_date ? String(targetEvent.start_date).slice(0, 10) : '',
          event_time: targetEvent?.start_time || '10:00 AM',
          event_venue: targetEvent?.venue || 'Indore HQ',
          event_fee: Number(targetEvent?.event_fee || r.amount || 0),
          is_paid: Boolean(targetEvent?.is_paid || r.amount > 0),
          event_banner: targetEvent?.banner_url || '',
          event_type: targetEvent?.event_type || 'GENERAL',
          event_status: targetEvent?.status || 'REGISTRATION_OPEN',
          can_attend: r.registration_status === 'CONFIRMED'
        };
      });
    }

    return list;
  },

  /**
   * Get registration for specific user and event
   */
  async getUserRegistration(eventId, userId) {
    const numEventId = Number(eventId);
    const numUserId = Number(userId);

    if (pool) {
      try {
        const res = await pool.query(
          'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2 LIMIT 1',
          [numEventId, numUserId]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            ...r,
            id: Number(r.id),
            event_id: Number(r.event_id),
            user_id: Number(r.user_id),
            amount: Number(r.amount || 0)
          };
        }
      } catch (err) {
        // Fallback to in-memory
      }
    }

    return inMemoryStore.eventRegistrations.find(
      r => r.event_id === numEventId && r.user_id === numUserId
    ) || null;
  },

  /**
   * Get all admin event registrations / join requests with member enrichment
   */
  async getAdminRegistrations(eventId = null) {
    await this.awaitInit();

    let list = [];

    if (pool) {
      try {
        let queryText = `
          SELECT 
            r.*,
            e.title AS event_title,
            e.start_date AS event_date,
            e.venue AS event_venue,
            e.event_fee,
            e.is_paid AS event_is_paid,
            mp.full_name AS member_name,
            u.email AS member_email,
            u.member_id AS employee_id,
            mp.phone AS member_phone,
            mp.avatar_url AS member_avatar,
            mp.circle AS member_circle,
            mp.designation AS member_designation
          FROM event_registrations r
          LEFT JOIN events e ON r.event_id = e.id
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN member_profiles mp ON u.id = mp.user_id
        `;
        const params = [];
        if (eventId) {
          params.push(Number(eventId));
          queryText += ` WHERE r.event_id = $${params.length}`;
        }
        queryText += ' ORDER BY r.registered_at DESC;';

        const res = await pool.query(queryText, params);
        if (res.rows.length > 0) {
          list = res.rows.map(r => ({
            ...r,
            id: Number(r.id),
            event_id: Number(r.event_id),
            user_id: Number(r.user_id),
            amount: Number(r.amount || 0),
            event_title: r.event_title || 'Union Event',
            event_date: r.event_date ? String(r.event_date).slice(0, 10) : '',
            event_venue: r.event_venue || 'Indore HQ',
            event_fee: Number(r.event_fee || 0),
            is_paid: Boolean(r.event_is_paid || r.amount > 0),
            member_name: r.member_name || 'Union Member',
            member_email: r.member_email || '',
            member_phone: r.member_phone || '',
            member_avatar: r.member_avatar || '',
            employee_id: r.employee_id || `MEM-${r.user_id}`,
            member_circle: r.member_circle || 'Indore Circle',
            member_designation: r.member_designation || 'Member'
          }));
        }
      } catch (err) {
        console.warn('⚠️ Error fetching admin registrations from PostgreSQL:', err.message);
      }
    }

    if (list.length === 0) {
      let regs = [...inMemoryStore.eventRegistrations];
      if (eventId) {
        regs = regs.filter(r => r.event_id === Number(eventId));
      }
      list = regs.map(r => {
        const targetEvent = inMemoryStore.events.find(e => e.id === r.event_id);
        const targetUser = inMemoryStore.users.find(u => u.id === r.user_id);
        return {
          ...r,
          event_title: targetEvent?.title || 'Union Event',
          event_date: targetEvent?.start_date ? String(targetEvent.start_date).slice(0, 10) : '',
          event_venue: targetEvent?.venue || 'Indore HQ',
          event_fee: Number(targetEvent?.event_fee || r.amount || 0),
          is_paid: Boolean(targetEvent?.is_paid || r.amount > 0),
          member_name: targetUser?.profile?.full_name || 'Union Member',
          member_email: targetUser?.email || '',
          member_phone: targetUser?.profile?.phone || '',
          member_avatar: targetUser?.profile?.avatar_url || '',
          employee_id: targetUser?.member_id || `MEM-${r.user_id}`,
          member_circle: targetUser?.profile?.circle || 'Indore Circle',
          member_designation: targetUser?.profile?.designation || 'Member'
        };
      });
    }

    return list;
  },

  /**
   * Toggle Like for an event
   */
  async toggleLike(eventId, user) {
    await this.awaitInit();
    const numEventId = Number(eventId);
    const userId = Number(user?.id);

    if (!numEventId || isNaN(numEventId)) {
      throw new Error('Valid numeric Event ID is required.');
    }
    if (!userId || isNaN(userId)) {
      throw new Error('Valid User ID is required.');
    }

    let liked = false;
    let likesCount = 0;

    if (pool) {
      try {
        const existing = await pool.query(
          'SELECT id FROM event_likes WHERE event_id = $1 AND user_id = $2',
          [numEventId, userId]
        );
        if (existing.rows.length > 0) {
          // Unlike: delete all rows matching this user and event to ensure no duplicates
          await pool.query('DELETE FROM event_likes WHERE event_id = $1 AND user_id = $2', [numEventId, userId]);
          liked = false;
        } else {
          // Like: insert safely preventing duplicates with ON CONFLICT DO NOTHING
          await pool.query(`
            INSERT INTO event_likes (event_id, user_id, created_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (event_id, user_id) DO NOTHING
          `, [numEventId, userId]);
          liked = true;
        }
        const countRes = await pool.query(
          'SELECT COUNT(*)::int AS count FROM event_likes WHERE event_id = $1',
          [numEventId]
        );
        likesCount = countRes.rows[0]?.count || 0;
      } catch (err) {
        console.error('Error toggling event like in DB:', err.message);
      }
    }

    // Sync with in-memory store
    if (!Array.isArray(inMemoryStore.eventLikes)) {
      inMemoryStore.eventLikes = [];
    }

    if (liked) {
      if (!inMemoryStore.eventLikes.some(l => l.event_id === numEventId && Number(l.user_id) === userId)) {
        inMemoryStore.eventLikes.push({
          id: Date.now(),
          event_id: numEventId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
      }
    } else {
      inMemoryStore.eventLikes = inMemoryStore.eventLikes.filter(
        l => !(l.event_id === numEventId && Number(l.user_id) === userId)
      );
    }

    if (!pool) {
      likesCount = inMemoryStore.eventLikes.filter(l => l.event_id === numEventId).length;
    }

    const memEvt = inMemoryStore.events.find(e => e.id === numEventId);
    if (memEvt) {
      memEvt.likes_count = likesCount;
    }

    saveInteractionsToBackup({
      likes: inMemoryStore.eventLikes,
      comments: inMemoryStore.eventComments || []
    });

    return { liked, likes_count: likesCount };
  },

  /**
   * Get all comments for an event
   */
  async getComments(eventId) {
    await this.awaitInit();
    const numEventId = Number(eventId);

    if (pool) {
      try {
        const res = await pool.query(`
          SELECT c.*,
            COALESCE(mp.full_name, u.email, c.author_name) AS author_name,
            COALESCE(mp.avatar_url, c.author_avatar) AS author_avatar
          FROM event_comments c
          LEFT JOIN users u ON c.user_id = u.id
          LEFT JOIN member_profiles mp ON u.id = mp.user_id
          WHERE c.event_id = $1
          ORDER BY c.created_at ASC
        `, [numEventId]);

        return res.rows.map(r => ({
          ...r,
          id: Number(r.id),
          event_id: Number(r.event_id),
          user_id: Number(r.user_id),
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
        }));
      } catch (err) {
        console.warn('⚠️ Error fetching comments from DB, falling back to cache:', err.message);
      }
    }

    return (inMemoryStore.eventComments || [])
      .filter(c => c.event_id === numEventId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  /**
   * Add a new comment to an event
   */
  async addComment(eventId, user, content) {
    await this.awaitInit();
    const numEventId = Number(eventId);
    const userId = Number(user.id);
    const trimmed = String(content || '').trim();

    if (!trimmed) {
      throw new Error('Comment content cannot be empty.');
    }

    const authorName = user.profile?.full_name || user.email?.split('@')[0] || 'Union Member';
    const authorAvatar = user.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

    let newComment = null;

    if (pool) {
      try {
        const res = await pool.query(`
          INSERT INTO event_comments (event_id, user_id, author_name, author_avatar, content, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *;
        `, [numEventId, userId, authorName, authorAvatar, trimmed]);

        if (res.rows.length > 0) {
          newComment = {
            ...res.rows[0],
            id: Number(res.rows[0].id),
            event_id: Number(res.rows[0].event_id),
            user_id: Number(res.rows[0].user_id),
            created_at: new Date(res.rows[0].created_at).toISOString()
          };
        }
      } catch (err) {
        console.error('Error inserting event comment into DB:', err.message);
      }
    }

    if (!newComment) {
      newComment = {
        id: Date.now(),
        event_id: numEventId,
        user_id: userId,
        author_name: authorName,
        author_avatar: authorAvatar,
        content: trimmed,
        created_at: new Date().toISOString()
      };
    }

    if (!Array.isArray(inMemoryStore.eventComments)) {
      inMemoryStore.eventComments = [];
    }
    inMemoryStore.eventComments.push(newComment);

    saveInteractionsToBackup({
      likes: inMemoryStore.eventLikes || [],
      comments: inMemoryStore.eventComments
    });

    let count = 0;
    if (pool) {
      try {
        const countRes = await pool.query(
          'SELECT COUNT(*)::int AS count FROM event_comments WHERE event_id = $1',
          [numEventId]
        );
        count = countRes.rows[0]?.count || 0;
      } catch (_) {
        count = inMemoryStore.eventComments.filter(c => Number(c.event_id) === numEventId).length;
      }
    } else {
      count = inMemoryStore.eventComments.filter(c => Number(c.event_id) === numEventId).length;
    }

    const targetEvt = inMemoryStore.events.find(e => e.id === numEventId);
    if (targetEvt) {
      targetEvt.comments_count = count;
    }

    return { comment: newComment, comments_count: count };
  },

  /**
   * Delete comment by ID
   */
  async deleteComment(commentId, user) {
    await this.awaitInit();
    const numCommentId = Number(commentId);
    const userId = Number(user.id);
    const isAdmin = user.role === 'admin';
    let targetEventId = null;

    if (pool) {
      try {
        const checkRes = await pool.query('SELECT event_id, user_id FROM event_comments WHERE id = $1', [numCommentId]);
        if (checkRes.rows.length > 0) {
          targetEventId = Number(checkRes.rows[0].event_id);
          const ownerId = Number(checkRes.rows[0].user_id);
          if (isAdmin || ownerId === userId) {
            await pool.query('DELETE FROM event_comments WHERE id = $1', [numCommentId]);
          } else {
            throw new Error('Not authorized to delete this comment.');
          }
        }
      } catch (err) {
        console.error('Error deleting event comment from DB:', err.message);
        throw err;
      }
    }

    if (Array.isArray(inMemoryStore.eventComments)) {
      const idx = inMemoryStore.eventComments.findIndex(
        c => c.id === numCommentId && (isAdmin || Number(c.user_id) === userId)
      );
      if (idx !== -1) {
        if (!targetEventId) targetEventId = inMemoryStore.eventComments[idx].event_id;
        inMemoryStore.eventComments.splice(idx, 1);
      }
    }

    let count = 0;
    if (targetEventId) {
      if (pool) {
        try {
          const countRes = await pool.query('SELECT COUNT(*)::int AS count FROM event_comments WHERE event_id = $1', [targetEventId]);
          count = countRes.rows[0]?.count || 0;
        } catch (_) {}
      } else {
        count = inMemoryStore.eventComments.filter(c => c.event_id === targetEventId).length;
      }
      const targetEvt = inMemoryStore.events.find(e => e.id === targetEventId);
      if (targetEvt) targetEvt.comments_count = count;
    }

    saveInteractionsToBackup({
      likes: inMemoryStore.eventLikes || [],
      comments: inMemoryStore.eventComments || []
    });

    return { success: true, event_id: targetEventId, comments_count: count };
  }
};
