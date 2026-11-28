import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../monthly-vrat-parv.html", import.meta.url), "utf8");
const widget = await readFile(new URL("../monthly-vrat-parv-widget.js", import.meta.url), "utf8");

test("both public readers use one approved year index and guard month transitions",()=>{
  assert.doesNotMatch(html,/<option value="2031">/);
  for(const source of [html,widget]){
    assert.match(source,/syncPublishedYearOptions\(yearSelect\)/);
    assert.match(source,/publishedYearNavigation\.has\(y\)/);
    assert.match(source,/publishedYearNavigation\.shift\(year,month,1\)/);
    assert.match(source,/publishedYearNavigation\.has\(requestedYear\)/);
  }
});

test("monthly festival page deduplicates links across description and metadata", () => {
  assert.match(html, /function linkKey\(value\)/);
  assert.match(html, /url\.searchParams\.delete\("m"\)/);
  assert.match(html, /function makeLink\(url,label,seenUrls\)/);
  assert.match(html, /function appendSafeDescriptionNode\(parent,node,seenUrls\)/);
  assert.match(html, /var cardLinkUrls=new Set\(\)/);
  assert.match(html, /renderDescription\(desc,description,cardLinkUrls\)/);
  assert.match(html, /makeLink\(item\.articleUrl,item\.articleLabel,cardLinkUrls\)/);
  assert.match(html, /makeLink\(eclipsePageUrl,"सूतक, मंत्र-जप एवं पुरश्चरण की जानकारी",cardLinkUrls\)/);
});

test("monthly widget canonicalizes mobile query variants before link deduplication", () => {
  assert.match(widget, /parsed\.searchParams\.delete\("m"\)/);
});

test("monthly widget opens a directly requested year and month", () => {
  assert.match(widget, /var requestedYear=Number\(pageParams\.get\("year"\)\)/);
  assert.match(widget, /var requestedMonth=Number\(pageParams\.get\("month"\)\)/);
  assert.match(widget, /validRequestedMonth/);
  assert.match(widget, /initialDate=new Date\(Date\.UTC\(requestedYear,requestedMonth-1,1,12,0,0\)\)/);
});
