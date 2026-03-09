
-- Allow users to update their own company
CREATE POLICY "Users can update own company"
ON public.companies
FOR UPDATE
TO authenticated
USING (id = get_user_company_id(auth.uid()))
WITH CHECK (id = get_user_company_id(auth.uid()));

-- Allow users to view team members in the same company
CREATE POLICY "Users can view team profiles in same company"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (company_id = get_user_company_id(auth.uid()));
