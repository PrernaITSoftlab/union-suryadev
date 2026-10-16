import { pool, inMemoryStore } from '../config/db.js';
import {
  ensureEventsSchemaAndSeed,
  normalizeEventRow,
  saveEventsToBackup,
  loadEventsFromBackup,
  saveInteractionsToBackup,
  loadInteractionsFromBackup,
  formatDbDate
} from '../db/syncEventsDb.js';

// Auto-run schema check and initial sync on module load
let initialSyncPromise = ensureEventsSchemaAndSeed().then(loaded => {
  if (Array.isArray(loaded) && loaded.length > 0) {
    inMemoryStore.events = [...loaded];
  }
}).catch(err => {
  console.warn('⚠️ Initial events sync notice:', err.message);
  const backup = loadEventsFromBackup();
  if (backup && backup.length > 0) {
    inMemoryStore.events = [...backup];
  }
});

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
          queryText += ' AND (e.visibility IS NULL OR e.visibility = \'PUBLIC\')';
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

        // Keep in-memory cache and backup updated with latest data from DB (clean of user-specific like flag)
        if (eventsList.length > 0 && !status && !search && !type && !isPublicOnly) {
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

    // In-memory fallback filtering if DB didn't run or threw
    if (eventsList.length === 0 && inMemoryStore.events.length > 0) {
      eventsList = [...inMemoryStore.events];
    }

    if (isPublicOnly) {
      eventsList = eventsList.filter(e => !e.visibility || e.visibility === 'PUBLIC');
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
      whatsapp_contact, visibility, status
    } = data;

    const defaultQr = inMemoryStore.systemSettings?.default_event_qr_url || "/images/payment-qr.png";
    const finalStartDate = formatDbDate(start_date) || new Date().toISOString().split('T')[0];
    const finalEndDate = formatDbDate(end_date) || finalStartDate;
    const finalRegStart = formatDbDate(registration_start_date) || finalStartDate;
    const finalRegEnd = formatDbDate(registration_end_date) || finalStartDate;

    let createdEvent = null;

    if (pool) {
      try {
        const queryText = `
          INSERT INTO events (
            title, description, banner_url, event_type, start_date, end_date,
            start_time, end_time, venue, address, capacity, registered_count,
            registration_start_date, registration_end_date, is_paid, event_fee,
            payment_qr_url, payment_instructions, whatsapp_contact, visibility,
            status, created_by, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16,
            $17, $18, $19, $20,
            $21, $22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          ) RETURNING *;
        `;

        const values = [
          title.trim(),
          description || '',
          banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          event_type || 'GENERAL',
          finalStartDate,
          finalEndDate,
          start_time || '10:00 AM',
          end_time || '05:00 PM',
          venue.trim(),
          address || venue,
          Number(capacity) || 500,
          0,
          finalRegStart,
          finalRegEnd,
          Boolean(is_paid),
          is_paid ? Number(event_fee) : 0,
          payment_qr_url || defaultQr,
          payment_instructions || 'Pay fee using QR code and submit UTR number.',
          whatsapp_contact || inMemoryStore.systemSettings?.payment_whatsapp_number || '+91 94249 44041',
          visibility || 'PUBLIC',
          status || 'REGISTRATION_OPEN',
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
        title: title.trim(),
        description: description || '',
        banner_url: banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        event_type: event_type || 'GENERAL',
        start_date: finalStartDate,
        end_date: finalEndDate,
        start_time: start_time || '10:00 AM',
        end_time: end_time || '05:00 PM',
        venue: venue.trim(),
        address: address || venue,
        capacity: Number(capacity) || 500,
        registered_count: 0,
        registration_start_date: finalRegStart,
        registration_end_date: finalRegEnd,
        is_paid: Boolean(is_paid),
        event_fee: is_paid ? Number(event_fee) : 0,
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
        const is_paid = updates.is_paid !== undefined ? Boolean(updates.is_paid) : curr.is_paid;
        const event_fee = updates.event_fee !== undefined ? Number(updates.event_fee) : curr.event_fee;
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
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $21
          RETURNING *;
        `;

        const res = await pool.query(updateQuery, [
          title, description, banner_url, event_type, start_date, end_date,
          start_time, end_time, venue, address, capacity, registration_start_date,
          registration_end_date, is_paid, event_fee, payment_qr_url, payment_instructions,
          whatsapp_contact, visibility, status, numId
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
        Object.assign(inMemoryStore.events[memIndex], updates, {
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
   * Delete an event by ID
   */
  async deleteEvent(id) {
    await this.awaitInit();
    const numId = Number(id);

    let deletedEvent = null;

    if (pool) {
      try {
        const res = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [numId]);
        if (res.rows.length > 0) {
          deletedEvent = normalizeEventRow(res.rows[0]);
        }
      } catch (err) {
        console.error('❌ Error deleting event from PostgreSQL:', err.message);
      }
    }

    const memIndex = inMemoryStore.events.findIndex(e => e.id === numId);
    if (memIndex !== -1) {
      const spliced = inMemoryStore.events.splice(memIndex, 1)[0];
      if (!deletedEvent) deletedEvent = spliced;
    }

    saveEventsToBackup(inMemoryStore.events);
    return deletedEvent;
  },

  /**
   * Register a user for an event
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

    // Check duplicate
    const existing = await this.getUserRegistration(numEventId, userId);
    if (existing) {
      const err = new Error('You have already registered for this event.');
      err.existing = existing;
      throw err;
    }

    const { transaction_id, payment_proof_url } = regData;
    const pass_code = `PASS-${(event.title || 'EVT').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let registrationStatus = 'CONFIRMED';
    let paymentStatus = 'CONFIRMED';

    if (event.is_paid && event.event_fee > 0) {
      if (!transaction_id) {
        throw new Error('Payment Transaction ID / UTR is required for paid events.');
      }
      registrationStatus = 'PENDING';
      paymentStatus = 'PAYMENT_PENDING';
    }

    let newReg = null;

    if (pool) {
      try {
        const insertReg = `
          INSERT INTO event_registrations (
            event_id, user_id, pass_code, amount, payment_status,
            registration_status, transaction_id, payment_proof_url, registered_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          RETURNING *;
        `;
        const regRes = await pool.query(insertReg, [
          numEventId, userId, pass_code, event.event_fee || 0,
          paymentStatus, registrationStatus, transaction_id || '',
          payment_proof_url || ''
        ]);

        if (regRes.rows.length > 0) {
          newReg = regRes.rows[0];
          newReg.id = Number(newReg.id);
          newReg.event_id = Number(newReg.event_id);
          newReg.user_id = Number(newReg.user_id);
          newReg.amount = Number(newReg.amount || 0);
        }

        // Increment registered_count in DB
        await pool.query('UPDATE events SET registered_count = registered_count + 1 WHERE id = $1', [numEventId]);
      } catch (dbErr) {
        console.error('❌ Error inserting registration into PostgreSQL:', dbErr.message);
      }
    }

    if (!newReg) {
      newReg = {
        id: inMemoryStore.eventRegistrations.length + 1,
        event_id: numEventId,
        user_id: userId,
        pass_code,
        amount: event.event_fee || 0,
        payment_status: paymentStatus,
        registration_status: registrationStatus,
        transaction_id: transaction_id || '',
        payment_proof_url: payment_proof_url || '',
        registered_at: new Date().toISOString()
      };
    }

    // Update inMemoryStore
    inMemoryStore.eventRegistrations.unshift(newReg);
    if (event) {
      event.registered_count = (event.registered_count || 0) + 1;
      const memEvt = inMemoryStore.events.find(e => e.id === numEventId);
      if (memEvt) memEvt.registered_count = event.registered_count;
    }

    // Record payment if paid
    if (event.is_paid && transaction_id) {
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

    saveEventsToBackup(inMemoryStore.events);
    return newReg;
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
   * Get all admin event registrations
   */
  async getAdminRegistrations() {
    await this.awaitInit();

    if (pool) {
      try {
        const queryText = `
          SELECT 
            r.*,
            e.title AS event_title,
            mp.full_name AS member_name,
            u.email AS member_email,
            mp.phone AS member_phone
          FROM event_registrations r
          LEFT JOIN events e ON r.event_id = e.id
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN member_profiles mp ON u.id = mp.user_id
          ORDER BY r.registered_at DESC;
        `;
        const res = await pool.query(queryText);
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            ...r,
            id: Number(r.id),
            event_id: Number(r.event_id),
            user_id: Number(r.user_id),
            amount: Number(r.amount || 0),
            event_title: r.event_title || 'Union Event',
            member_name: r.member_name || 'Union Member',
            member_email: r.member_email || '',
            member_phone: r.member_phone || ''
          }));
        }
      } catch (err) {
        console.warn('⚠️ Error fetching admin registrations from PostgreSQL:', err.message);
      }
    }

    return inMemoryStore.eventRegistrations.map(r => {
      const targetEvent = inMemoryStore.events.find(e => e.id === r.event_id);
      const targetUser = inMemoryStore.users.find(u => u.id === r.user_id);
      return {
        ...r,
        event_title: targetEvent?.title || 'Union Event',
        member_name: targetUser?.profile?.full_name || 'Union Member',
        member_email: targetUser?.email || '',
        member_phone: targetUser?.profile?.phone || ''
      };
    });
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
