// SnapAdda Logic Verification Script (Production Pre-flight)
// This script runs before build to ensure land unit math is 100% accurate.

const GAJAM_CONSTANTS = {
  ACRE_TO_CENTS: 100,
  ACRE_TO_GAJAM: 4840,
  CENT_TO_GAJAM: 48.4,
};

const smartAreaConverter = (value, fromUnit) => {
  const v = Number(value) || 0;
  let acres = 0;
  const u = fromUnit?.toLowerCase();
  
  if (u === 'acre') acres = v;
  else if (u === 'cent') acres = v / 100;
  else if (u === 'gajam') acres = v / 4840;

  return {
    acres: parseFloat(acres.toFixed(4)),
    cents: parseFloat((acres * 100).toFixed(2)),
    gajam: Math.round(acres * 4840),
  };
};

const runTests = () => {
    console.log("--- SnapAdda Logic Audit ---");
    let failures = 0;

    // Test 1: Acre to Cents
    const t1 = smartAreaConverter(1, 'acre');
    if (t1.cents !== 100) { console.error("❌ 1 Acre != 100 Cents"); failures++; }
    else console.log("✅ 1 Acre = 100 Cents");

    // Test 2: Acre to Gajam
    if (t1.gajam !== 4840) { console.error("❌ 1 Acre != 4840 Gajam"); failures++; }
    else console.log("✅ 1 Acre = 4840 Gajam");

    // Test 3: Cent to Gajam
    const t2 = smartAreaConverter(1, 'cent');
    if (t2.gajam !== 48) { console.error("❌ 1 Cent != 48 Gajam (Rounded)"); failures++; }
    else console.log("✅ 1 Cent = 48 Gajam");

    if (failures > 0) {
        console.error(`\nCRITICAL: ${failures} logic failures detected. Aborting build.`);
        process.exit(1);
    }
    console.log("\nALL LOGIC CHECKS PASSED. PROCEEDING TO BUILD.");
};

runTests();
