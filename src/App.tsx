import { useState } from 'react';

interface ContributionInput {
    annualSalary: number;
    contributionPercent: number;
    employerMatchPercent: number;
    employerMatchCap: number;
    showGrowth: boolean;
    yearsToRetirement: number;
    expectedReturn: number;
}

const IRS_LIMIT_2026 = 23500; // Employee contribution limit

const TIPS: string[] = [
    'Contribute at least enough to get your full employer match',
    'The 2026 IRS limit is $23,500 ($31,000 if age 50+)',
    'Employer contributions do not count toward your personal limit',
    'Consider increasing contributions by 1% each year'
];

function App() {
    const [values, setValues] = useState<ContributionInput>({
        annualSalary: 75000,
        contributionPercent: 6,
        employerMatchPercent: 50,
        employerMatchCap: 6,
        showGrowth: false,
        yearsToRetirement: 30,
        expectedReturn: 7
    });

    const handleChange = (field: keyof ContributionInput, value: number | boolean) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    // Calculate contributions
    const employeeContribution = Math.round(values.annualSalary * (values.contributionPercent / 100));
    const cappedContributionPercent = Math.min(values.contributionPercent, values.employerMatchCap);
    const employerMatch = Math.round(values.annualSalary * (cappedContributionPercent / 100) * (values.employerMatchPercent / 100));

    // IRS limit check
    const overLimit = employeeContribution > IRS_LIMIT_2026;
    const effectiveEmployeeContribution = Math.min(employeeContribution, IRS_LIMIT_2026);
    const effectiveTotal = effectiveEmployeeContribution + employerMatch;

    // Monthly amounts
    const monthlyEmployee = Math.round(effectiveEmployeeContribution / 12);
    const monthlyEmployer = Math.round(employerMatch / 12);
    const monthlyTotal = monthlyEmployee + monthlyEmployer;

    // Growth projection (compound interest)
    let futureValue = 0;
    if (values.showGrowth && values.yearsToRetirement > 0) {
        const r = values.expectedReturn / 100;
        const n = values.yearsToRetirement;
        // Future value of annuity formula
        futureValue = effectiveTotal * ((Math.pow(1 + r, n) - 1) / r);
    }

    const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <main style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <header style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>401(k) Calculator (2026)</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Maximize your retirement savings</p>
            </header>

            <div className="card">
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div>
                        <label htmlFor="annualSalary">Annual Salary ($)</label>
                        <input id="annualSalary" type="number" min="0" max="1000000" step="1000" value={values.annualSalary || ''} onChange={(e) => handleChange('annualSalary', parseInt(e.target.value) || 0)} placeholder="75000" />
                    </div>
                    <div>
                        <label htmlFor="contributionPercent">Your Contribution (%)</label>
                        <input id="contributionPercent" type="number" min="0" max="100" step="1" value={values.contributionPercent || ''} onChange={(e) => handleChange('contributionPercent', parseInt(e.target.value) || 0)} placeholder="6" />
                        {overLimit && (
                            <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 'var(--space-1)' }}>
                                Exceeds 2026 IRS limit of {fmt(IRS_LIMIT_2026)}. Contribution will be capped.
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="employerMatchPercent">Employer Match Rate (%)</label>
                        <input id="employerMatchPercent" type="number" min="0" max="200" step="10" value={values.employerMatchPercent || ''} onChange={(e) => handleChange('employerMatchPercent', parseInt(e.target.value) || 0)} placeholder="50" />
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                            e.g., 50% means employer matches 50 cents per dollar you contribute
                        </div>
                    </div>
                    <div>
                        <label htmlFor="employerMatchCap">Employer Match Cap (% of salary)</label>
                        <input id="employerMatchCap" type="number" min="0" max="100" step="1" value={values.employerMatchCap || ''} onChange={(e) => handleChange('employerMatchCap', parseInt(e.target.value) || 0)} placeholder="6" />
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                            Employer only matches up to this % of your salary
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                        <input id="showGrowth" type="checkbox" checked={values.showGrowth} onChange={(e) => handleChange('showGrowth', e.target.checked)} />
                        <label htmlFor="showGrowth" style={{ margin: 0, cursor: 'pointer', flex: 1 }}>
                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Show Growth Projection</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Estimate future value with compound growth</span>
                        </label>
                    </div>
                    {values.showGrowth && (
                        <>
                            <div>
                                <label htmlFor="yearsToRetirement">Years Until Retirement</label>
                                <input id="yearsToRetirement" type="number" min="1" max="50" value={values.yearsToRetirement || ''} onChange={(e) => handleChange('yearsToRetirement', parseInt(e.target.value) || 0)} placeholder="30" />
                            </div>
                            <div>
                                <label htmlFor="expectedReturn">Expected Annual Return (%)</label>
                                <input id="expectedReturn" type="number" min="0" max="20" step="0.5" value={values.expectedReturn || ''} onChange={(e) => handleChange('expectedReturn', parseFloat(e.target.value) || 0)} placeholder="7" />
                            </div>
                        </>
                    )}
                    <button className="btn-primary" type="button">Calculate Contributions</button>
                </div>
            </div>

            <div className="card results-panel">
                <div className="text-center">
                    <h2 className="result-label" style={{ marginBottom: 'var(--space-2)' }}>Total Annual Contribution</h2>
                    <div className="result-hero">{fmt(effectiveTotal)}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>Your contribution + employer match</div>
                </div>
                <hr className="result-divider" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', textAlign: 'center' }}>
                    <div>
                        <div className="result-label">You/Month</div>
                        <div className="result-value">{fmt(monthlyEmployee)}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #BAE6FD', paddingLeft: 'var(--space-4)' }}>
                        <div className="result-label">Employer/Month</div>
                        <div className="result-value" style={{ color: '#16A34A' }}>{fmt(monthlyEmployer)}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #BAE6FD', paddingLeft: 'var(--space-4)' }}>
                        <div className="result-label">Total/Month</div>
                        <div className="result-value">{fmt(monthlyTotal)}</div>
                    </div>
                </div>
                {values.showGrowth && futureValue > 0 && (
                    <>
                        <hr className="result-divider" />
                        <div className="text-center">
                            <div className="result-label">Projected Value in {values.yearsToRetirement} Years</div>
                            <div className="result-value" style={{ fontSize: '1.5rem', color: '#0C4A6E' }}>{fmt(Math.round(futureValue))}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>At {values.expectedReturn}% annual return</div>
                        </div>
                    </>
                )}
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>401(k) Tips</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
                    {TIPS.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />{item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="ad-container"><span>Advertisement</span></div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1rem' }}>Contribution Breakdown</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Source</th>
                            <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Monthly</th>
                            <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', color: 'var(--color-text-secondary)' }}>Annual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-text-secondary)' }}>Your Contribution ({values.contributionPercent}%)</td>
                            <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', fontWeight: 500 }}>{fmt(monthlyEmployee)}</td>
                            <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontWeight: 500 }}>{fmt(effectiveEmployeeContribution)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                            <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-text-secondary)' }}>Employer Match ({values.employerMatchPercent}% up to {values.employerMatchCap}%)</td>
                            <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', fontWeight: 500, color: '#16A34A' }}>+{fmt(monthlyEmployer)}</td>
                            <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontWeight: 500, color: '#16A34A' }}>+{fmt(employerMatch)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: 'var(--space-3) var(--space-6)', color: 'var(--color-text-primary)', fontWeight: 600 }}>Total Contributions</td>
                            <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center', fontWeight: 700, color: '#0C4A6E' }}>{fmt(monthlyTotal)}</td>
                            <td style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontWeight: 700, color: '#0C4A6E' }}>{fmt(effectiveTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <p>This calculator provides estimates for 401(k) contributions based on your inputs. The 2026 IRS contribution limit is $23,500 for employees under 50, with an additional $7,500 catch-up for those 50 and older. Employer contributions do not count toward your personal limit. These figures are estimates only and do not constitute financial advice. Growth projections assume consistent contributions and returns. Consult a financial advisor for personalized retirement planning.</p>
            </div>

            <footer style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-8)' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-4)', fontSize: '0.875rem' }}>
                    <li>• Estimates only</li><li>• Not financial advice</li><li>• Free to use</li>
                </ul>
                <p style={{ marginTop: 'var(--space-4)', fontSize: '0.75rem' }}>&copy; 2026 401(k) Calculator</p>
            </footer>

            <div className="ad-container ad-sticky"><span>Advertisement</span></div>
        </main>
    );
}

export default App;
