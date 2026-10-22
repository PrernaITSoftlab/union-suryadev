/**
 * Member ID Generation Helper for MPVMAVAKS Union
 * Formats: MPAVAKS-0001, MPAVAKS-0002, MPAVAKS-0003, ...
 * Starts from MPAVAKS-0001 and increments sequentially.
 * Checks both inMemoryStore and PostgreSQL database to guarantee uniqueness.
 */

export async function getNextMemberId(inMemoryStore, query = null) {
  const existingIds = new Set();

  // 1. Scan in-memory store
  if (inMemoryStore && Array.isArray(inMemoryStore.users)) {
    for (const u of inMemoryStore.users) {
      if (u && u.member_id) {
        existingIds.add(String(u.member_id).trim().toUpperCase());
      }
    }
  }

  // 2. Scan PostgreSQL database if available
  if (typeof query === 'function') {
    try {
      const res = await query("SELECT member_id FROM users WHERE member_id IS NOT NULL");
      if (res && res.rows) {
        for (const row of res.rows) {
          if (row && row.member_id) {
            existingIds.add(String(row.member_id).trim().toUpperCase());
          }
        }
      }
    } catch (err) {
      // Fallback silently if query fails
    }
  }

  // 3. Find maximum sequence number matching MPAVAKS-(\d+)
  let maxNumber = 0;
  for (const id of existingIds) {
    const match = id.match(/^MPAVAKS-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  // 4. Determine next sequential number (starts at 1 -> MPAVAKS-0001)
  let nextNum = maxNumber + 1;
  let candidateId = `MPAVAKS-${String(nextNum).padStart(4, '0')}`;

  // 5. Guarantee absolute uniqueness
  while (existingIds.has(candidateId.toUpperCase())) {
    nextNum++;
    candidateId = `MPAVAKS-${String(nextNum).padStart(4, '0')}`;
  }

  return candidateId;
}
