const taxNumberRegex = /^(\d{8}-?\d-?\d{2}|\d{11})$/;

const testCases = [
    "12345678-1-12", // Valid hyphenated
    "12345678112",   // Valid non-hyphenated
    "12345678-1-1",  // Invalid length
    "12345678-1-123", // Invalid length
    "12345678-x-12", // Invalid char
    "1234567811",    // Invalid length (short)
    "123456781123",  // Invalid length (long)
    "",              // Empty
    undefined,       // Undefined
];

testCases.forEach(tc => {
    if (tc) {
        console.log(`'${tc}': ${taxNumberRegex.test(tc)}`);
    } else {
        console.log(`'${tc}': (skipped regex test)`);
    }
});
