

# Plan: Make Salary Bands Manageable (like Departments)

## Overview
Mirror the existing `departments` pattern to create a `salary_bands` table in the database with full CRUD, a `SalaryBandManager` settings component, and update all references from the hardcoded `SALARY_BANDS` array to use live data.

## Steps

### 1. Create `salary_bands` database table
- Migration: create `salary_bands` table with columns `id` (uuid PK), `name` (text, not null), `company_id` (uuid, not null), `created_at` (timestamptz, default now())
- Add unique constraint on `(company_id, name)` to prevent duplicates
- Enable RLS with same policies as `departments` (company-scoped CRUD for authenticated users)
- Seed default bands (Junior, Mid, Senior, Management, Executive) for the existing demo company

### 2. Add CRUD hooks in `use-supabase-data.ts`
- `useSalaryBands(companyId)` — mirrors `useDepartments`
- `useAddSalaryBand()` — mirrors `useAddDepartment`
- `useUpdateSalaryBand()` — mirrors `useUpdateDepartment`
- `useDeleteSalaryBand()` — mirrors `useDeleteDepartment`

### 3. Create `SalaryBandManager` component
- Clone `DepartmentManager` pattern exactly, replacing department terminology with "Salary Band"
- Same add/edit/delete inline UX with confirmation dialog for deletes

### 4. Add to Settings page
- Import and render `<SalaryBandManager />` below `<DepartmentManager />` on the Company tab

### 5. Update consumers to use live data
- **`EmployeeFormDialog`**: Accept `salaryBands` prop (string[]) instead of importing `SALARY_BANDS`
- **`InlineEditableRow`**: Accept `salaryBands` prop instead of importing `SALARY_BANDS`
- **`Employees.tsx`**: Fetch salary bands via `useSalaryBands`, derive string array, pass to form dialog and inline row
- **`EmployeeFilters`**: If salary band filtering exists, update similarly

### 6. Keep `SALARY_BANDS` in mockData as demo fallback
- Used when `isDemoMode` is true, same pattern as departments

