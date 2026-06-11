# Deployment Checklist — The Drop (Dropper/Admin Features)

## Pre-Deployment

- [ ] Apply database trigger `prevent_invalid_drop_status()` in Supabase
- [ ] Deploy latest `broadcast-location` Edge Function
- [ ] Run `npm run build` with zero errors
- [ ] Test all role-based visibility (Dropper vs Admin vs Super Admin)

## Dropper Flow Testing

- [ ] Dropper can only see their assigned drops
- [ ] "Start Live Tracking" correctly passes `drop_id`
- [ ] Claiming a drop via QR updates status to `claimed`
- [ ] Proof upload works (photo + video)
- [ ] Location is recorded during claim

## Admin Flow Testing

- [ ] Admin can reassign drops
- [ ] Admin can mark drops as expired
- [ ] Status changes are logged in `activity_log`

## Status Management

- [ ] Invalid status transitions are blocked (both frontend + database trigger)
- [ ] Status badges update correctly after changes
- [ ] `DropStatusActions` only shows valid actions

## General

- [ ] Error handling works on poor network conditions
- [ ] Realtime updates reflect status changes across devices
- [ ] Mobile responsiveness tested on actual device
