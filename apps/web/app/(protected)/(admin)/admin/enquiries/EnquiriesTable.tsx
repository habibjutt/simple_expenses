"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateEnquiryStatus, deleteEnquiry } from "@/app/api/contact-action";

type Enquiry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  adminNote: string | null;
  createdAt: Date;
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#4f6ef7",
  read: "#f59e0b",
  replied: "#22c55e",
  closed: "#64748b",
};

const SUBJECT_LABELS: Record<string, string> = {
  billing: "Billing & Subscription",
  technical: "Technical Support",
  feature: "Feature Request",
  account: "Account Issues",
  privacy: "Privacy & Data",
  other: "Other",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#64748b";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: `${color}22`, color }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function EnquiriesTable({
  enquiries: initial,
}: {
  enquiries: Enquiry[];
}) {
  const [enquiries, setEnquiries] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function handleStatusChange(id: string, status: string) {
    setLoadingId(id);
    startTransition(async () => {
      const res = await updateEnquiryStatus(id, status);
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
        toast.success(`Marked as ${STATUS_LABELS[status]}`);
      }
      setLoadingId(null);
    });
  }

  function handleSaveNote(id: string) {
    const note = noteValues[id] ?? "";
    const enquiry = enquiries.find((e) => e.id === id);
    setLoadingId(id);
    startTransition(async () => {
      const res = await updateEnquiryStatus(id, enquiry?.status ?? "read", note);
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, adminNote: note } : e))
        );
        toast.success("Note saved");
      }
      setLoadingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    setLoadingId(id);
    startTransition(async () => {
      const res = await deleteEnquiry(id);
      if (res.success) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
        toast.success("Enquiry deleted");
      }
      setLoadingId(null);
    });
  }

  if (enquiries.length === 0) {
    return (
      <div
        className="rounded-xl border py-16 text-center text-sm"
        style={{ borderColor: "#1a2d4a", background: "#0f1e38", color: "#64748b" }}
      >
        No enquiries found.
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "#1a2d4a", background: "#0f1e38" }}
    >
      {/* Mobile cards */}
      <div className="md:hidden divide-y" style={{ borderColor: "#1a2d4a" }}>
        {enquiries.map((e) => (
          <div key={e.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                {e.firstName} {e.lastName}
              </p>
              <StatusBadge status={e.status} />
            </div>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {e.email}
            </p>
            <p className="text-xs" style={{ color: "#64748b" }}>
              {SUBJECT_LABELS[e.subject] ?? e.subject}
            </p>
            <button
              onClick={() => toggleExpand(e.id)}
              className="flex items-center gap-1 text-xs mt-1"
              style={{ color: "#4f6ef7" }}
            >
              {expanded === e.id ? (
                <><ChevronUp className="w-3 h-3" /> Hide</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> View message</>
              )}
            </button>
            {expanded === e.id && (
              <p
                className="text-xs leading-relaxed border-l-2 pl-3 py-1 mt-1"
                style={{ borderColor: "#4f6ef7", color: "#94a3b8" }}
              >
                {e.message}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "#1a2d4a" }}>
              {["Name", "Email", "Subject", "Status", "Date", "Actions"].map((h) => (
                <TableHead
                  key={h}
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#3d5a80" }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.map((e) => (
              <>
                <TableRow
                  key={e.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: "#1a2d4a" }}
                  onClick={() => toggleExpand(e.id)}
                >
                  <TableCell className="font-medium text-white">
                    {e.firstName} {e.lastName}
                  </TableCell>
                  <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                    {e.email}
                  </TableCell>
                  <TableCell className="text-xs" style={{ color: "#94a3b8" }}>
                    {SUBJECT_LABELS[e.subject] ?? e.subject}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap" style={{ color: "#64748b" }}>
                    {new Date(e.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell onClick={(ev) => ev.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-[#1a2d4a] text-[#94a3b8] hover:bg-[#1a2d4a]"
                          disabled={loadingId === e.id && pending}
                        >
                          {loadingId === e.id && pending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            STATUS_LABELS[e.status]
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <DropdownMenuItem
                            key={key}
                            disabled={e.status === key}
                            onClick={() => handleStatusChange(e.id, key)}
                          >
                            {label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(e.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded detail row */}
                {expanded === e.id && (
                  <TableRow
                    key={`${e.id}-detail`}
                    style={{ borderColor: "#1a2d4a", background: "#0a1628" }}
                  >
                    <TableCell colSpan={6} className="px-6 py-4 space-y-4">
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: "#3d5a80" }}
                        >
                          Message
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                          {e.message}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: "#3d5a80" }}
                        >
                          Admin Note
                        </p>
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={
                              noteValues[e.id] !== undefined
                                ? noteValues[e.id]
                                : (e.adminNote ?? "")
                            }
                            onChange={(ev) =>
                              setNoteValues((prev) => ({
                                ...prev,
                                [e.id]: ev.target.value,
                              }))
                            }
                            placeholder="Add an internal note…"
                            className="flex-1 px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none"
                            style={{
                              borderColor: "#1a2d4a",
                              background: "#0f1e38",
                              color: "#94a3b8",
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-auto border-[#1a2d4a] text-[#94a3b8] hover:bg-[#1a2d4a]"
                            onClick={() => handleSaveNote(e.id)}
                            disabled={loadingId === e.id && pending}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
