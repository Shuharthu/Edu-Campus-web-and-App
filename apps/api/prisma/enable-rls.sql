-- Enable PostgreSQL Row Level Security (RLS) on all Smart EDU tables in exposed public schema.
-- With no permissive anon/authenticated policies, Supabase PostgREST Data API blocks external REST access
-- while NestJS/Prisma (connecting as the database owner / postgres role) operates normally.

ALTER TABLE IF EXISTS public."Institution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Campus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."RolePermission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."UserRoleAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ApprovalRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ApprovalStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Device" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."FeatureFlag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."DataExportRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."NotificationPreference" ENABLE ROW LEVEL SECURITY;
