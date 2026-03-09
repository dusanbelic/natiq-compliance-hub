// ═══════════════════════════════════════════════════════════════════════════
// NatIQ Export Utilities - CSV/Excel & PDF Generation
// ═══════════════════════════════════════════════════════════════════════════

import type { Employee, DashboardData, RegulatoryChange } from '@/types/database';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Employee List Export ────────────────────────────────────────────────────

export function exportEmployeesCSV(employees: Employee[], entityName: string) {
  const headers = ['Name', 'Nationality', 'Is National', 'Job Title', 'Department', 'Contract Type', 'Counts Toward Quota', 'Start Date', 'Salary Band'];
  const rows = employees.map(e => [
    e.full_name,
    e.nationality,
    e.is_national ? 'Yes' : 'No',
    e.job_title || '',
    e.department || '',
    e.contract_type,
    e.counts_toward_quota ? 'Yes' : 'No',
    e.start_date || '',
    e.salary_band || '',
  ]);

  const csv = [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `employees_${entityName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
}

// ─── Compliance Certificate Export ──────────────────────────────────────────

export function exportCompliancePDF(data: DashboardData) {
  const { entity, score } = data;
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
<!DOCTYPE html>
<html><head>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px solid #0E7C7B; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: #0E7C7B; margin: 0; font-size: 28px; }
  .header p { color: #666; margin: 5px 0 0; }
  .badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
  .compliant { background: #D1FAE5; color: #059669; }
  .at-risk { background: #FEF3C7; color: #D97706; }
  .non-compliant { background: #FEE2E2; color: #DC2626; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  th { background: #f8fafc; font-weight: 600; }
  .score { font-size: 48px; font-weight: 700; color: #0E7C7B; text-align: center; margin: 20px 0; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 12px; }
  .section { margin: 25px 0; }
  .section h2 { color: #1B3A5C; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
</style>
</head><body>
<div class="header">
  <h1>NatIQ Compliance Certificate</h1>
  <p>Generated on ${now}</p>
</div>

<div class="section">
  <h2>Entity Information</h2>
  <table>
    <tr><th>Entity Name</th><td>${entity.name}</td></tr>
    <tr><th>Country</th><td>${entity.country}</td></tr>
    <tr><th>Industry</th><td>${entity.industry_sector || 'N/A'}</td></tr>
    <tr><th>Programme</th><td>${score.program}</td></tr>
  </table>
</div>

<div class="score">${score.ratio.toFixed(1)}%</div>
<div style="text-align:center;margin-bottom:20px;">
  <span class="badge ${score.status === 'COMPLIANT' ? 'compliant' : score.status === 'AT_RISK' ? 'at-risk' : 'non-compliant'}">
    ${score.status} — ${score.band}
  </span>
</div>

<div class="section">
  <h2>Workforce Breakdown</h2>
  <table>
    <tr><th>Category</th><th>Count</th></tr>
    <tr><td>Total Qualifying Workforce</td><td>${score.qualifying_total}</td></tr>
    <tr><td>Qualifying Nationals</td><td>${score.qualifying_nationals}</td></tr>
    <tr><td>Full-time Nationals</td><td>${score.nationals_full_time}</td></tr>
    <tr><td>Part-time Nationals</td><td>${score.nationals_part_time}</td></tr>
    <tr><td>Contract Nationals (excluded)</td><td>${score.nationals_contract}</td></tr>
    <tr><td><strong>Target</strong></td><td><strong>${score.target}%</strong></td></tr>
    <tr><td><strong>Current Ratio</strong></td><td><strong>${score.ratio.toFixed(1)}%</strong></td></tr>
  </table>
</div>

<div class="section">
  <h2>Department Breakdown</h2>
  <table>
    <tr><th>Department</th><th>Total</th><th>Nationals</th><th>Ratio</th></tr>
    ${data.department_breakdown.map(d => `
    <tr>
      <td>${d.dept}</td>
      <td>${d.total}</td>
      <td>${d.nationals}</td>
      <td>${d.ratio.toFixed(1)}%</td>
    </tr>`).join('')}
  </table>
</div>

<div class="footer">
  <p>This document was generated automatically by NatIQ — GCC Nationalization Compliance Platform</p>
  <p>This is an informational document and does not constitute legal or regulatory advice.</p>
</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  
  // Open in a new window for printing as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}

// ─── Workforce Audit Pack (Excel/CSV) ───────────────────────────────────────

export function exportWorkforceAuditCSV(employees: Employee[], data: DashboardData) {
  const { entity, score, department_breakdown } = data;
  
  // Summary section
  const lines = [
    `Workforce Audit Pack — ${entity.name}`,
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    `Programme: ${score.program}`,
    `Compliance Ratio: ${score.ratio.toFixed(1)}%`,
    `Target: ${score.target}%`,
    `Status: ${score.status}`,
    '',
    'DEPARTMENT SUMMARY',
    'Department,Total,Nationals,Expats,Ratio',
    ...department_breakdown.map(d => `${escapeCsv(d.dept)},${d.total},${d.nationals},${d.expats},${d.ratio.toFixed(1)}%`),
    '',
    'EMPLOYEE ROSTER',
    'Name,Nationality,Is National,Job Title,Department,Contract Type,Counts Toward Quota,Start Date,Salary Band',
    ...employees.map(e => [
      escapeCsv(e.full_name),
      e.nationality,
      e.is_national ? 'Yes' : 'No',
      escapeCsv(e.job_title || ''),
      escapeCsv(e.department || ''),
      e.contract_type,
      e.counts_toward_quota ? 'Yes' : 'No',
      e.start_date || '',
      e.salary_band || '',
    ].join(',')),
  ];

  const csv = lines.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `workforce_audit_${entity.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
}

// ─── Forecast Report ────────────────────────────────────────────────────────

export function exportForecastPDF(data: DashboardData, forecast: { projected_30d: number; projected_60d: number; projected_90d: number; risk_date: string | null; confidence: string }) {
  const { entity, score } = data;
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
<!DOCTYPE html>
<html><head>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px solid #0E7C7B; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: #0E7C7B; margin: 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  th { background: #f8fafc; font-weight: 600; }
  .alert { background: #FEF3C7; border: 1px solid #D97706; padding: 12px; border-radius: 8px; margin: 20px 0; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 12px; }
</style>
</head><body>
<div class="header">
  <h1>90-Day Compliance Forecast Report</h1>
  <p>${entity.name} — Generated ${now}</p>
</div>

${forecast.risk_date ? `<div class="alert">⚠️ Risk Date: Compliance may breach minimum around ${forecast.risk_date}</div>` : ''}

<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Current Ratio</td><td>${score.ratio.toFixed(1)}%</td></tr>
  <tr><td>Target</td><td>${score.target}%</td></tr>
  <tr><td>30-Day Projection</td><td>${forecast.projected_30d.toFixed(1)}%</td></tr>
  <tr><td>60-Day Projection</td><td>${forecast.projected_60d.toFixed(1)}%</td></tr>
  <tr><td>90-Day Projection</td><td>${forecast.projected_90d.toFixed(1)}%</td></tr>
  <tr><td>Confidence</td><td>${forecast.confidence}</td></tr>
</table>

<div class="footer">
  <p>Generated by NatIQ — GCC Nationalization Compliance Platform</p>
</div>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}

// ─── Regulatory Impact Summary ──────────────────────────────────────────────

export function exportRegulatoryCSV(changes: RegulatoryChange[]) {
  const headers = ['Country', 'Programme', 'Headline', 'Impact Level', 'Change Type', 'Effective Date', 'Detected At', 'Summary'];
  const rows = changes.map(c => [
    c.country,
    c.program,
    c.headline,
    c.impact_level || '',
    c.change_type || '',
    c.effective_date || '',
    c.detected_at,
    c.summary || '',
  ]);

  const csv = [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `regulatory_changes_${new Date().toISOString().split('T')[0]}.csv`);
}
