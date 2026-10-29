-- ============================================================
-- HealthProvida — Booking Migration
-- Adds a trigger to release appointment slots when bookings
-- are cancelled.
-- ============================================================

-- Function: release the linked appointment slot when an
-- appointment status transitions to 'cancelled'
CREATE OR REPLACE FUNCTION release_slot_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when the status has actually changed to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
    IF NEW.slot_id IS NOT NULL THEN
      UPDATE appointment_slots
      SET is_booked = false
      WHERE id = NEW.slot_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: fires AFTER UPDATE on appointments
CREATE TRIGGER trg_release_slot_on_cancel
  AFTER UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled')
  EXECUTE FUNCTION release_slot_on_cancel();
