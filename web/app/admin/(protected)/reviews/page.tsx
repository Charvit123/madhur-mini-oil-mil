"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { adminListReviews, adminApproveReview, adminRejectReview, adminDeleteReview } from "@/lib/adminApi";
import type { AdminReview } from "@/lib/types";
import { Tag } from "../AdminShell";
import { formatDate } from "@/lib/format";
import { exportCsv } from "@/lib/exportCsv";

/** Deliberately deletable only. An admin moderates (approve/reject decide
 *  whether a customer's review is published) but never edits a review's
 *  words, and there is no "add new review" here — that would put fabricated
 *  reviews on the storefront. */
export default function AdminReviewsPage() {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    if (!token) return;
    adminListReviews(token).then(setReviews).catch((e) => setError(e instanceof Error ? e.message : "Could not load reviews."));
  }
  useEffect(reload, [token]);

  async function approve(r: AdminReview) { if (!token) return; await adminApproveReview(token, r.id); reload(); }
  async function reject(r: AdminReview) { if (!token) return; await adminRejectReview(token, r.id); reload(); }
  async function remove(r: AdminReview) {
    if (!token) return;
    if (!confirm(`Delete this review by ${r.authorName}? This can't be undone.`)) return;
    await adminDeleteReview(token, r.id);
    reload();
  }

  function doExport() {
    if (!reviews) return;
    exportCsv("reviews.csv", reviews.map((r) => ({
      Customer: r.authorName, City: r.city ?? "", Product: r.productName, Rating: r.rating,
      Title: r.title ?? "", Review: r.body ?? "", "Verified purchase": r.verifiedPurchase ? "Yes" : "No",
      Status: r.status, Date: formatDate(r.createdAt),
    })));
  }

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.7rem]">Reviews</h1>
          <p className="text-sm text-ink-3">Approve, reject or delete customer reviews. Reviews can't be edited or added from here.</p>
        </div>
        <button onClick={doExport} disabled={!reviews?.length} className="rounded-control border border-line-2 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">Export CSV</button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#E7C3BD] bg-[#FCEDEA] px-5 py-5 text-[#7E241A]">{error}</div>
      ) : reviews === null ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-paper-2" />)}</div>
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-2 bg-white px-5 py-8 text-center text-ink-3">No reviews yet.</p>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#E6E3DC] bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>{["Customer", "Product", "Rating", "Review", "Status", ""].map((h) => (
                <th key={h} className="border-b border-[#E6E3DC] px-3.5 py-3 text-left text-xs font-semibold text-[#7A756C]">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3"><b>{r.authorName}</b><br /><span className="text-[0.82rem] text-ink-3">{r.city}</span></td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{r.productName}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">{r.rating} / 5</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3 max-w-[32ch]">{r.title && <b className="block">{r.title}</b>}{(r.body ?? "").slice(0, 90)}{(r.body?.length ?? 0) > 90 ? "…" : ""}</td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <Tag ok={r.status === "PUBLISHED"}>{r.status === "PUBLISHED" ? "Published" : r.status === "PENDING" ? "Pending" : "Rejected"}</Tag>
                  </td>
                  <td className="border-b border-[#F0EEE9] px-3.5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {r.status !== "PUBLISHED" && <button onClick={() => approve(r)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Publish</button>}
                      {r.status !== "REJECTED" && <button onClick={() => reject(r)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold">Reject</button>}
                      <button onClick={() => remove(r)} className="rounded-control border border-line-2 px-2.5 py-1.5 text-xs font-semibold text-err">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
