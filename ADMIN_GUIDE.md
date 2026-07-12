# Admin Dashboard Guide

A guide to using the AV1-Company admin dashboard — for content editors and
administrators, not developers. For the technical/developer view, see
[admin/README.md](admin/README.md).

## Logging in

Go to the dashboard URL (`http://localhost:3000` locally, or your production
admin URL) — you'll land on the login page. Sign in with your email and
password.

If you don't have an account, an **Administrator** needs to create one for
you from the **Users** page (see [Managing users](#managing-users-admin-only)).

There are two roles:

- **Admin** — full access to everything, including Users and permanently
  deleting media.
- **Editor** — can manage all content and upload/replace media, but cannot
  manage Users or permanently delete a media asset.

## Dashboard home

After logging in you land on the dashboard home, which shows live counts for
each content type (Projects, Gallery, Videos, Testimonials, FAQs, etc.) and
recent Contact Messages. Click any summary card to jump straight to that
section's list.

## Managing content

Every content type in the left sidebar (Projects, Gallery, Before/After,
Videos, Services, Testimonials, FAQs) works the same way:

1. Click the section in the sidebar to see its list — a searchable, sortable
   table.
2. Click **New** (top right) to create an entry, or click a row to edit it.
3. Fill in the form and click **Save**. Required fields are marked and show
   an inline error if left empty or invalid.
4. To remove an entry, select its checkbox in the list (or open it and use
   the delete action) and confirm — deletion cannot be undone.

### Multi-language fields

Most content fields come in **three language versions** — English, German,
and Albanian — shown side by side in the form (labeled EN / DE / SQ). Fill in
all three before saving; the public site falls back to nothing (not another
language) if one is left blank.

### Publishing

Every content item has a **Published** toggle. Unpublished items are visible
in the admin dashboard but never appear on the public site — use this to
prepare content ahead of time or temporarily hide something without deleting
it.

### Ordering

Most lists have an **Order** field — a plain number controlling display order
on the public site (lower numbers first). There's no drag-to-reorder; edit
the number directly on each item.

## Media (images and video)

Wherever a form has an image field, click it (or drag a file onto it) to
upload. A few things to know:

- **Uploading** replaces the placeholder with your image immediately — no
  separate "save" step needed for the image itself (though you still need to
  click **Save** on the form to keep the rest of your changes).
- **Replace** on an already-uploaded image swaps the file in place — anywhere
  else that image was already being used stays pointed at the same asset,
  now updated.
- **Remove** clears the image from this record only. It does not permanently
  delete the file — this is intentional, so Editors can freely change their
  mind about an image without needing special permissions.
- Accepted file types: JPEG, PNG, WebP, AVIF, GIF for images; MP4, WebM, MOV
  for video. Maximum size: 25MB per file.

## Contact Messages

Messages submitted through the public site's contact form land here,
newest first. Each message has a status:

- **New** — not yet reviewed.
- **Read** — you've seen it.
- **Archived** — handled, kept for records.

Click a message to view the full text and change its status. Delete a
message once you no longer need it.

## Settings

Business information shown on the public site — company name, phone, email,
address, business hours, and social media links. There's one Settings record
for the whole site; edit and save it like any other form.

Note: the public site's homepage copy (headlines, section text) is **not**
editable here — it's separate from Settings. Contact a developer if that
needs to change.

## Managing users (Admin only)

Only Admins can see and use the **Users** page. From here you can:

- Create a new account (email, name, password, role).
- Edit an existing account — change their name, password, or role, or
  deactivate them (deactivated users can't log in, but their account and
  history are preserved).
- Delete an account entirely.

**Roles**: give someone **Editor** unless they specifically need to manage
other users' accounts or need to permanently delete media assets — Admin is
the more powerful role and should be limited to people who need it.

## Your profile

Click your name/avatar (top right) → **Profile** to view your account
details and change your own password.

## Signing out

Click your name/avatar → **Log out**. This ends your session on this device;
you'll need to log in again next time.

## Tips

- Changes take effect on the public site as soon as you click **Save** and
  the item is **Published** — there's no separate "publish" step or delay.
- If something looks wrong after saving, double-check the **Published**
  toggle and the **Order** number first — the two most common reasons new
  content doesn't show up where expected.
- If you get logged out unexpectedly, your session likely expired — just log
  back in; nothing unsaved is lost unless you were mid-edit on a form.

For technical issues (the dashboard won't load, uploads keep failing, etc.),
see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or contact a developer.
