"use client";

export default function AdminLayout({ children }) {
  return (
    <>
      <style jsx global>{`
        body:has(.admin-layout) .bf-topbar,
        body:has(.admin-layout) .bf-header,
        body:has(.admin-layout) .bf-header-spacer,
        body:has(.admin-layout) .announcement-bar,
        body:has(.admin-layout) .header:not(.admin-header),
        body:has(.admin-layout) header:not(.admin-header),
        body:has(.admin-layout) footer:not(.admin-footer),
        body:has(.admin-layout) .ft-footer:not(.admin-footer),
        body:has(.admin-login-page) .bf-topbar,
        body:has(.admin-login-page) .bf-header,
        body:has(.admin-login-page) .bf-header-spacer,
        body:has(.admin-login-page) .announcement-bar,
        body:has(.admin-login-page) .header:not(.admin-header),
        body:has(.admin-login-page) header:not(.admin-header),
        body:has(.admin-login-page) footer:not(.admin-footer),
        body:has(.admin-login-page) .ft-footer:not(.admin-footer) {
          display: none !important;
        }

        body:has(.admin-layout),
        body:has(.admin-login-page) {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>

      {children}
    </>
  );
}