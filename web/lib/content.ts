/** Marketing copy that isn't catalogue data — same arrays as the prototype. */

export const PROCESS: [string, string][] = [
  ["Seed buying", "Groundnut and til bought lot by lot at the Gondal and Jetpur yards, graded by hand."],
  ["Cleaning", "De-stoning, sieving and air cleaning until the lot is free of husk and grit."],
  ["Pressing", "Expeller and wooden ghani, run slow so the seed stays cool."],
  ["Filtering", "Settled, then filtered twice through cloth and press filters. No bleaching."],
  ["Lab check", "Every batch checked for FFA, moisture and peroxide before it can be packed."],
  ["Packing", "Filled, sealed and batch-coded the same week, then loaded for dispatch."],
];

export const WHY: [string, string][] = [
  ["Pressed at our own mill", "No trading, no repacking. What you get was pressed on our machines in Rajkot."],
  ["Batch dated on every pack", "Look for the pressing date on the crimp. Nothing leaves us older than a week."],
  ["Filtered, not refined", "Mechanical filtering only, so the aroma and the vitamin E survive."],
  ["Lab tested every batch", "FFA, moisture and peroxide values recorded for each lot, available on request."],
  ["Pack sizes for every kitchen", "From a 500 ml bottle to a 15 kg tin for a canteen."],
  ["Two generations, one mill", "Started in 1992 by Hasmukhbhai, run today by his sons and their team of eleven."],
];

export const TESTIMONIALS: [string, string, string, string][] = [
  ["We run a 200-cover thali house and go through a 15 kg tin every two days. The consistency between tins is what keeps us on this mill.", "Rakesh Bhanushali", "Hotel owner, Jamnagar", "RB"],
  ["I switched my parents to the filtered groundnut oil after my father's cholesterol report. Two years later they refuse to use anything else.", "Dr Sejal Mehta", "Physician, Rajkot", "SM"],
  ["Ordered the 5 litre tin on a Tuesday and it reached Vadodara on Friday, packed better than most courier parcels I get.", "Amit Rana", "Home cook, Vadodara", "AR"],
];

export const SITE_FAQ: [string, string][] = [
  ["Do you deliver across India?", "Yes. Gujarat orders usually arrive in two to four days, the rest of India in four to seven. Tins and buckets ship in corrugated outer boxes."],
  ["Is there a minimum order?", "No minimum for retail. Wholesale pricing starts at twenty tins, which we quote over the phone."],
  ["What is the return policy on oil?", "Sealed food items cannot be returned once opened. If a pack arrives leaking or damaged, send a photo within 48 hours and we replace it."],
  ["How do I know when the oil was pressed?", "The pressing date and batch number are printed on the crimp of every tin and on the neck label of every bottle."],
  ["Can I visit the mill?", "Yes, on weekdays between 10am and 5pm. Call a day ahead so someone is free to walk you through the pressing floor."],
];

export const TIMELINE: [string, string, string][] = [
  ["1992", "One expeller, borrowed shed", "Hasmukhbhai started pressing groundnut for neighbours who brought their own seed and paid by weight."],
  ["1999", "The Gondal Road mill", "The family bought the plot the mill still sits on and added a second expeller and a filter press."],
  ["2008", "Sesame and the wooden ghani", "A slow ghani went in for til, because the customers who asked for it would not accept anything heated."],
  ["2016", "Lab on the floor", "An in-house bench for FFA, moisture and peroxide, so no batch is packed on assumption."],
  ["2026", "Selling direct", "The same tins that go to shops now go straight to homes, at the price shops pay."],
];

export const NAV_ITEMS: [string, string][] = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["About us", "/about"],
  ["Contact", "/contact"],
];

// "Content" and "Settings" were placeholder stubs with no real data behind
// them (no CMS model, no settings model) — dropped rather than left as dead
// tabs. Every tab left here maps to a real, working admin screen.
export const ADMIN_NAV = [
  "Dashboard", "Oils", "Packaging", "Products", "Orders", "Customers",
  "Inventory", "Payments", "Reviews", "Admins",
] as const;
