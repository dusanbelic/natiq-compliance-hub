-- Make target_percentage nullable to support headcount-based rules (UAE 20-49 employees)
ALTER TABLE compliance_rules ALTER COLUMN target_percentage DROP NOT NULL;

-- Now re-seed all data
TRUNCATE TABLE compliance_rules RESTART IDENTITY CASCADE;
TRUNCATE TABLE regulatory_changes RESTART IDENTITY CASCADE;

-- SA: Technology
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Technology', 50, 499, 15.00, 16.22, 26.52, null, '2024-01-01', 'https://qiwa.sa', 'Low Green minimum 16.22%. ICT sector has lower quotas due to skill scarcity.');
-- SA: Retail
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Retail', 50, 499, 20.00, 20.00, 26.52, null, '2024-01-01', 'https://qiwa.sa', 'General retail 20% minimum Green.');
-- SA: Construction
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Construction', 50, 499, 10.00, 10.00, 26.52, null, '2024-01-01', 'https://qiwa.sa', 'Construction 10% floor for standard construction activity.');
-- SA: Hospitality
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Hospitality', 50, 499, 18.00, 18.00, 26.52, null, '2024-01-01', 'https://qiwa.sa', 'Raised from 15% in 2024 as part of Vision 2030 tourism push.');
-- SA: Finance
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Finance', 50, 499, 35.00, 35.00, 26.52, null, '2024-05-01', 'https://qiwa.sa', 'Finance and consulting firms must have 40% Saudi nationals in key roles.');
-- SA: Healthcare
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Healthcare', 1, null, 65.00, 65.00, 80.00, null, '2025-07-27', 'https://mhrsd.gov.sa', 'Hospitals: 65% from July 27 2025.');
-- SA: Engineering
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Engineering', 5, null, 30.00, 30.00, 45.00, null, '2025-07-27', 'https://mhrsd.gov.sa', '30% from July 27 2025 for firms with 5+ engineers.');
-- SA: Accounting Phase 1
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, effective_to, source_url, notes) VALUES ('SA', 'Nitaqat', 'Accounting', 5, null, 40.00, 40.00, 60.00, null, '2025-10-27', '2026-10-26', 'https://mhrsd.gov.sa', 'Phase 1: 40% from Oct 27 2025.');
-- SA: Accounting Phase 2
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Accounting', 5, null, 50.00, 50.00, 70.00, null, '2026-10-27', 'https://mhrsd.gov.sa', 'Phase 2: 50% from Oct 27 2026.');
-- SA: Dentistry Phase 1
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, effective_to, source_url, notes) VALUES ('SA', 'Nitaqat', 'Dentistry', 3, null, 45.00, 45.00, 60.00, null, '2025-07-27', '2026-01-26', 'https://mhrsd.gov.sa', 'Phase 1: 45% for dental clinics with 3+ dental professionals.');
-- SA: Dentistry Phase 2
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', 'Dentistry', 3, null, 55.00, 55.00, 70.00, null, '2026-01-27', 'https://mhrsd.gov.sa', 'Phase 2: 55% from Jan 27 2026.');
-- SA: Default (50-499)
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', null, 50, 499, 15.00, 16.22, 26.52, null, '2024-01-01', 'https://qiwa.sa', 'Default fallback for sectors not specifically listed.');
-- SA: Large (500+)
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('SA', 'Nitaqat', null, 500, null, 30.00, 30.00, 40.00, null, '2024-01-01', 'https://qiwa.sa', 'Companies with 500+ employees require 30%+ Saudisation.');

-- UAE: 50+ employees 2025
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, effective_to, source_url, notes) VALUES ('AE', 'Emiratisation', null, 50, null, 8.00, 8.00, 12.00, 6.00, '2025-01-01', '2025-12-31', 'https://nafis.gov.ae', '8% target for 2025.');
-- UAE: 50+ employees 2026
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('AE', 'Emiratisation', null, 50, null, 10.00, 10.00, 15.00, 7.00, '2026-01-01', 'https://nafis.gov.ae', '10% final target under Nafis mandate.');
-- UAE: 20-49 designated sectors (headcount-based, no percentage)
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('AE', 'Emiratisation', 'Designated Sectors (20-49 employees)', 20, 49, null, null, null, null, '2025-01-01', 'https://mohre.gov.ae', 'Fixed headcount rule. Must hire 2 Emiratis by end 2025.');
-- UAE: Banking
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('AE', 'Emiratisation', 'Banking', 1, null, 45.00, 45.00, 55.00, 35.00, '2026-01-01', 'https://centralbank.ae', 'Banking sector 45% by 2026 under Ethraa programme.');
-- UAE: Insurance
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('AE', 'Emiratisation', 'Insurance', 1, null, 30.00, 30.00, 40.00, 20.00, '2026-01-01', 'https://ia.gov.ae', '30% target by 2026.');

-- QA: Overall
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('QA', 'Qatarisation', null, 1, null, 20.00, 20.00, 30.00, 10.00, '2025-04-01', 'https://adlsa.gov.qa', 'Law No. 12/2024 effective April 2025. National Development Strategy 2024-30 targets 20%.');
-- QA: Energy
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('QA', 'Qatarisation', 'Energy', 1, null, 50.00, 50.00, 65.00, 35.00, '2025-04-01', 'https://adlsa.gov.qa', 'Energy sector 50% localisation target since 2000.');
-- QA: Finance
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('QA', 'Qatarisation', 'Finance', 1, null, 30.00, 30.00, 50.00, 20.00, '2025-04-01', 'https://adlsa.gov.qa', 'Private sector finance estimated at 30%.');

-- OM: Banking
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('OM', 'Omanisation', 'Banking', 1, null, 60.00, 60.00, 80.00, 45.00, '2024-01-01', 'https://manpower.gov.om', '60% overall minimum.');
-- OM: Finance
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('OM', 'Omanisation', 'Finance', 1, null, 45.00, 45.00, 65.00, 30.00, '2024-01-01', 'https://manpower.gov.om', '45% target for finance and insurance.');
-- OM: Transport
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('OM', 'Omanisation', 'Transport', 1, null, 21.00, 21.00, 35.00, 15.00, '2025-01-01', 'https://manpower.gov.om', '21% target for 2025.');
-- OM: Technology
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('OM', 'Omanisation', 'Technology', 1, null, 31.00, 31.00, 45.00, 20.00, '2025-01-01', 'https://manpower.gov.om', '31% target for ICT sector.');
-- OM: Retail
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('OM', 'Omanisation', 'Retail', 1, null, 20.00, 20.00, 35.00, 12.00, '2024-01-01', 'https://manpower.gov.om', 'Retail lowest at 20%.');
-- OM: Construction
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('OM', 'Omanisation', 'Construction', 1, null, 35.00, 35.00, 50.00, 25.00, '2024-01-01', 'https://manpower.gov.om', 'Construction rising from 30-35% to 65%.');
-- OM: Default
INSERT INTO compliance_rules (country, program_name, industry_sector, company_size_min, company_size_max, target_percentage, band_green_min, band_platinum_min, band_yellow_min, effective_from, source_url, notes) VALUES ('OM', 'Omanisation', null, 1, null, 35.00, 35.00, 55.00, 20.00, '2024-04-01', 'https://manpower.gov.om', 'Default fallback. All foreign-owned companies must hire at least 1 Omani from April 2024.');

-- REGULATORY CHANGES
INSERT INTO regulatory_changes (country, program, headline, summary, impact_level, effective_date, change_type, affects_sectors) VALUES
('SA', 'Nitaqat', 'Engineering firms (5+ engineers) must reach 30% Saudisation from July 27 2025', 'MHRSD mandated 30% engineering workforce Saudisation from July 27 2025. Min salary SAR 7,000/month.', 'HIGH', '2025-07-27', 'TARGET_INCREASE', ARRAY['Engineering']),
('SA', 'Nitaqat', 'Accounting firms must reach 40% Saudisation from October 27 2025 (rising to 70% by 2028)', 'Five-year phased plan. Phase 1: 40% from Oct 27 2025, increasing 10% annually.', 'HIGH', '2025-10-27', 'TARGET_INCREASE', ARRAY['Accounting', 'Finance']),
('SA', 'Nitaqat', 'Hospital Saudisation raised to 65%; community pharmacies to 35% from July 27 2025', 'MHRSD updated healthcare targets. Hospitals: 65%. Pharmacies: 35%.', 'HIGH', '2025-07-27', 'TARGET_INCREASE', ARRAY['Healthcare', 'Dentistry']),
('SA', 'Nitaqat', 'Foreign investors now count as Saudi nationals in Nitaqat quota calculations (April 2024)', 'Foreign investors owning private establishments now count as Saudi nationals in quota.', 'MEDIUM', '2024-04-11', 'NEW_REGULATION', NULL),
('SA', 'Nitaqat', 'Minimum salary for Saudi employees to count toward Nitaqat raised to SAR 4,000/month', 'Min wage threshold raised from SAR 3,000 to SAR 4,000. SAR 2,000-3,999 counts as 0.5.', 'MEDIUM', '2024-01-01', 'NEW_REGULATION', NULL),
('AE', 'Emiratisation', 'UAE Emiratisation target reaches 8% in 2025, with 7% mid-year checkpoint', 'MoHRE confirmed 8% target for 50+ employee companies. 7% by June 30, 8% by Dec 31.', 'HIGH', '2025-01-01', 'TARGET_INCREASE', NULL),
('AE', 'Emiratisation', 'Emiratisation fine increases to AED 9,000/month per missing position from July 2025', 'Monthly fine up from AED 8,000 to AED 9,000 per unfilled position from July 1 2025.', 'HIGH', '2025-07-01', 'FINE_CHANGE', NULL),
('AE', 'Emiratisation', 'Minimum Emirati salary raised to AED 6,000/month from January 2026', 'AED 6,000 minimum for Emirati employees to count toward quota from Jan 1 2026.', 'HIGH', '2026-01-01', 'NEW_REGULATION', NULL),
('AE', 'Emiratisation', 'Companies with 20-49 employees in 14 designated sectors must hire 2 Emiratis by end of 2025', 'Expanded to smaller companies in 14 sectors. Fine: AED 108,000 per missing hire.', 'HIGH', '2025-01-01', 'NEW_REGULATION', ARRAY['Finance', 'Real Estate', 'Technology', 'Retail', 'Construction', 'Manufacturing']),
('QA', 'Qatarisation', 'Qatar Law No. 12/2024 on Qatarisation comes into force April 2025', 'Landmark law requiring priority hiring for Qataris. Fines QAR 10,000-1,000,000.', 'HIGH', '2025-04-01', 'NEW_REGULATION', NULL),
('OM', 'Omanisation', 'Oman tightens Omanisation for state contract tenders — deadline May 2026', 'Non-compliant companies ineligible for government tenders from May 31 2026.', 'HIGH', '2025-06-02', 'NEW_REGULATION', NULL),
('OM', 'Omanisation', 'Transport Omanisation target set at 21% for 2025, rising annually to 100%', 'MTCIT confirmed 21% in 2025, increasing annually. Sub-targets for supervisory roles.', 'MEDIUM', '2025-01-01', 'TARGET_INCREASE', ARRAY['Transport', 'Logistics']);