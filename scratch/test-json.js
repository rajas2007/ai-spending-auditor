
const audit = {
  userId: undefined,
  input: {},
  result: {},
  website: undefined
};

console.log("JSON.stringify(audit):", JSON.stringify(audit));

const auditWithNull = {
  userId: null,
  input: {},
  result: {},
  website: null
};

console.log("JSON.stringify(auditWithNull):", JSON.stringify(auditWithNull));
