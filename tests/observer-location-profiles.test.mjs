import assert from "node:assert/strict";
import test from "node:test";
import dataset from "../data/observer-location-profiles.json" with { type: "json" };
import {
  createCustomObserverProfile,
  findObserverProfile,
  validateObserverProfileDataset
} from "../research/observer-location-profiles.mjs";

test("Pithoragarh observer profile preserves the project target coordinates and elevation", () => {
  const profiles = validateObserverProfileDataset(dataset);
  assert.equal(profiles.length, 12);
  assert.ok(profiles.every(profile => profile.calculationEligible === true));
  const pithoragarh = findObserverProfile(dataset, "pithoragarh-uttarakhand");
  assert.equal(pithoragarh.latitude, 29.5828);
  assert.equal(pithoragarh.longitude, 80.2182);
  assert.equal(pithoragarh.elevationMeters, 1650);
  assert.equal(pithoragarh.timeZone, "Asia/Kolkata");
  assert.deepEqual(pithoragarh.observer, {
    latitude: 29.5828,
    longitude: 80.2182,
    height: 1650
  });
});

test("major metro benchmark profiles are present and have explicit observer coordinates", () => {
  for (const id of ["new-delhi", "mumbai", "kolkata", "chennai", "bengaluru", "hyderabad", "ahmedabad", "pune", "jaipur", "ujjain-madhya-pradesh", "varanasi-uttar-pradesh"]) {
    const profile = findObserverProfile(dataset, id);
    assert.ok(profile, "missing " + id);
    assert.ok(Number.isFinite(profile.elevationMeters));
    assert.equal(profile.timeZone, "Asia/Kolkata");
  }
});

test("Surat is explicitly pending and cannot be used as a calculation profile", () => {
  assert.equal(dataset.pendingLocations.find(item => item.id === "surat").calculationEligible, false);
});

test("unknown city does not silently fall back to Pithoragarh", () => {
  assert.equal(findObserverProfile(dataset, "unknown-city"), null);
});

test("custom coordinates require explicit elevation and a valid timezone", () => {
  const custom = createCustomObserverProfile({
    latitude: 28.367,
    longitude: 79.430,
    elevationMeters: 170,
    timeZone: "Asia/Kolkata",
    name: "उदाहरण स्थान"
  });
  assert.equal(custom.observer.latitude, 28.367);
  assert.equal(custom.observer.longitude, 79.43);
  assert.throws(() => createCustomObserverProfile({
    latitude: 28.367,
    longitude: 79.43,
    elevationMeters: null,
    timeZone: "Asia/Kolkata"
  }), /elevationMeters/);
  assert.throws(() => createCustomObserverProfile({
    latitude: 28.367,
    longitude: 79.43,
    elevationMeters: 170,
    timeZone: "Invalid/Zone"
  }), /IANA time-zone/);
});

test("invalid coordinates and duplicate profile IDs are rejected", () => {
  assert.throws(() => validateObserverProfileDataset({
    schemaVersion: 1,
    profiles: [{ ...dataset.profiles[0], latitude: 91 }]
  }), /latitude/);
  assert.throws(() => validateObserverProfileDataset({
    schemaVersion: 1,
    profiles: [dataset.profiles[0], dataset.profiles[0]]
  }), /Duplicate/);
});
