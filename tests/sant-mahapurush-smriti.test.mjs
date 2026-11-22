import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "data", "festivals");
const readMonth = key => JSON.parse(fs.readFileSync(path.join(root, key + ".json"), "utf8"));
const find = (key, title) => (readMonth(key).events || []).find(event => event.title === title);

test("Sant-Mahapurush remembrance cards exist independently for 2026–2030", () => {
  const expected = [
    ["2026-08", "गोस्वामी तुलसीदास जयंती", "2026-08-19"],
    ["2027-08", "गोस्वामी तुलसीदास जयंती", "2027-08-08"],
    ["2028-07", "गोस्वामी तुलसीदास जयंती", "2028-07-28"],
    ["2029-08", "गोस्वामी तुलसीदास जयंती", "2029-08-16"],
    ["2030-08", "गोस्वामी तुलसीदास जयंती", "2030-08-06"],
    ["2026-03", "चैतन्य महाप्रभु जयंती", "2026-03-03"],
    ["2027-03", "चैतन्य महाप्रभु जयंती", "2027-03-21"],
    ["2028-03", "चैतन्य महाप्रभु जयंती", "2028-03-10"],
    ["2029-02", "चैतन्य महाप्रभु जयंती", "2029-02-28"],
    ["2030-03", "चैतन्य महाप्रभु जयंती", "2030-03-19"],
    ["2026-09", "हनुमान प्रसाद पोद्दार जयंती", "2026-09-17"],
    ["2027-09", "हनुमान प्रसाद पोद्दार जयंती", "2027-09-17"],
    ["2028-09", "हनुमान प्रसाद पोद्दार जयंती", "2028-09-17"],
    ["2029-09", "हनुमान प्रसाद पोद्दार जयंती", "2029-09-17"],
    ["2030-09", "हनुमान प्रसाद पोद्दार जयंती", "2030-09-17"],
    ["2026-12", "बाबा नीब करौरी जयंती", "2026-12-17"],
    ["2027-12", "बाबा नीब करौरी जयंती", "2027-12-06"],
    ["2028-11", "बाबा नीब करौरी जयंती", "2028-11-24"],
    ["2029-12", "बाबा नीब करौरी जयंती", "2029-12-13"],
    ["2030-12", "बाबा नीब करौरी जयंती", "2030-12-02"]
  ];
  for (const [month, title, date] of expected) {
    const event = find(month, title);
    assert.ok(event, month + " is missing " + title);
    assert.equal(event.date, date, title + " date mismatch in " + month);
    assert.equal(event.category, "संत-महापुरुष स्मृति");
    assert.ok((event.description || "").length >= 80, title + " needs descriptive copy");
    assert.doesNotMatch(event.description, /अन्नदान|दान करें|दान करें।/);
  }
});

test("Chaitanya Mahaprabhu remains an independent Phalguna Purnima card", () => {
  for (const month of ["2026-03","2027-03","2028-03","2029-02","2030-03"]) {
    const event = find(month, "चैतन्य महाप्रभु जयंती");
    assert.equal(event.hinduTithi, "फाल्गुन शुक्ल पूर्णिमा");
  }
});
