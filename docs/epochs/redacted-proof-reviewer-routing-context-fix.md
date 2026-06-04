# Redacted Proof Reviewer Routing Context Fix

## Purpose

This fix closes the runtime gap found after the first redacted-proof upload/storage validation pass.

The gap was specific:

- redacted proof upload worked
- private storage worked
- request and evidence metadata were created safely
- but airline-scoped reviewers could not see proof requests in the queue

Why:

- redacted proof evidence carried no airline routing metadata
- airline-scoped reviewer filtering depended on evidence metadata
- proof requests were therefore invisible unless a reviewer had a temporary global scope

## Fix Summary

The proof-upload path now carries a bounded airline routing hint in evidence metadata:

- `requested_airline`
- `routing_context_source`

This routing hint is used only for reviewer queue routing and reviewer metadata display.

It is explicitly not:

- a verified claim
- proof by itself
- automatic authorization
- automatic claim issuance

## Routing Context Behavior

`/app/verification` now includes a bounded proof-routing field:

- label: `Requested airline for reviewer routing`
- prefilled from profile `claimed_airline` when available
- editable by the user before upload
- required for proof upload submission

The field is presented as self-declared routing context only.

If the submitted value matches the current profile `claimed_airline`, the upload stores:

- `routing_context_source = profile_claimed_airline`

If the user edits the value or no matching profile value exists, the upload stores:

- `routing_context_source = self_declared`

## Metadata Stored

Proof evidence metadata still stores safe upload-only fields:

- `file_size_bytes`
- `mime_type`
- `original_extension`
- `upload_client`
- `redaction_acknowledged`
- `evidence_method`

It now also stores bounded reviewer-routing context:

- `requested_airline`
- `routing_context_source`

Sensitive fields still remain excluded:

- raw filename
- storage path
- proof content
- OCR text
- employee IDs
- badge numbers
- barcode content
- QR code content

## Reviewer Queue Behavior

Airline-scoped reviewers may now match redacted proof requests using:

- approved work-email airline metadata for work-email requests
- `requested_airline` for redacted proof requests

The reviewer queue still remains metadata-only.

It still does not expose:

- storage path
- signed URL
- public URL
- preview
- download button
- proof file viewing

## Claim And Verification Boundaries

This fix does not change the proof-verification trust boundary.

Still true:

- no claims are issued at upload time
- no automatic approval exists
- no role claim is issued
- no base claim is issued
- self-declared or profile-derived airline routing context is not treated as proof
- reviewer approval remains required for any future claim issuance

The existing bounded review logic still refuses to treat redacted proof routing context as issuable claim evidence.

## Security And Privacy

This fix does not add:

- employer-system lookup
- AI
- storage readback
- reviewer downloads
- signed URLs

Security-event logging remains sanitized and does not log:

- storage path
- raw filename
- proof contents
- OCR text
- employee IDs
- badge numbers

`requested_airline` remains queue-visible self-declared routing context, but this fix does not newly log it in security-event metadata.

## Migration Status

- No migration was needed.
- Existing JSONB evidence metadata was sufficient.
- No remote `db push` is required for this fix.

## Runtime Follow-Up

After merge, the next runtime pass should reconfirm:

- proof upload still succeeds
- proof upload still rejects missing acknowledgement and unsupported files
- airline-scoped reviewer can now see a proof request whose `requested_airline` matches their scope
- unrelated airline-scoped reviewers still cannot see mismatched proof requests
- queue output remains metadata-only with no proof viewing surface
