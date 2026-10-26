-- RouteNest shipment creation and automatic status-history support.
-- Run this in Supabase SQL Editor after reviewing the current RLS policies.
-- This does not drop or recreate any table.

DROP POLICY IF EXISTS "Authenticated users create their own shipments" ON public.logistics_shipments;
CREATE POLICY "Authenticated users create their own shipments"
ON public.logistics_shipments
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- The status-history trigger needs to insert a history row even though clients
-- cannot directly insert history rows. SECURITY DEFINER lets the trusted trigger
-- function write history while the table remains protected by RLS.
CREATE OR REPLACE FUNCTION public.record_logistics_status_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.logistics_status_history (shipment_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status, 'Initial shipment status', NEW.user_id);
    RETURN NEW;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.logistics_status_history (shipment_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status, 'Shipment status updated', auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure existing authenticated users cannot read or write another user's rows:
-- keep the existing own-shipment SELECT policy and own-history SELECT policy enabled.
