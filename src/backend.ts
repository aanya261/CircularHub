import type { Product } from "./types";

export type PendingListing = Omit<Product, "id"> & {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  seller: string;
};

export type BackendActivity = {
  id: string;
  trackingId: string;
  type: string;
  title: string;
  description: string;
  status?: string;
  timestamp: number;
  amount?: number;
};

export async function fetchApprovedListings(): Promise<Product[]> {
  const response = await fetch("/api/listings", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load approved listings");
  }

  const rows = await response.json();

  return rows.map(
    (row: Product & { id: string | number }) => ({
      ...row,
      id:
        typeof row.id === "number"
          ? row.id
          : parseInt(String(row.id).slice(-8), 16),
    })
  );
}

export async function submitListing(
  listing: Omit<Product, "id"> & {
    images?: string[];
  }
) {
  const response = await fetch("/api/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listing),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to submit listing"
    );
  }

  return data;
}

export async function submitActivity(
  activity: Omit<
    BackendActivity,
    "id" | "timestamp"
  > & {
    fields?: Array<[string, string]>;
  }
) {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activity),
  });

  if (!response.ok) {
    throw new Error("Unable to save activity");
  }
}

export async function adminLogin(
  username: string,
  password: string
) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Invalid administrator credentials."
    );
  }

  return data as {
    token: string;
    username: string;
  };
}

/*
 * Fetch admin listings.
 *
 * "pending" = listings waiting for approval
 * "approved" = listings currently live
 * on the marketplace
 */
export async function fetchPendingListings(
  token: string,
  status: "pending" | "approved" = "pending"
): Promise<PendingListing[]> {
  const response = await fetch(
    `/api/admin/listings?status=${encodeURIComponent(
      status
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = await response
    .json()
    .catch(() => []);

  if (!response.ok) {
    throw new Error(
      data.error ||
        `Unable to load ${status} listings`
    );
  }

  return data;
}

export async function reviewListing(
  token: string,
  id: string,
  status: "approved" | "rejected"
) {
  const response = await fetch(
    `/api/admin/listings/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to update listing"
    );
  }

  return data;
}

/*
 * DELETE LISTING
 *
 * Used by the administrator to permanently
 * remove a listing from Neon.
 *
 * This works for both:
 * - Pending listings
 * - Already approved marketplace listings
 */
export async function deleteListing(
  token: string,
  id: string
) {
  const response = await fetch(
    `/api/admin/listings/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to delete listing"
    );
  }

  return data;
}

export async function fetchAdminActivities(
  token: string
): Promise<BackendActivity[]> {
  const response = await fetch(
    "/api/admin/activities",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = await response
    .json()
    .catch(() => []);

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to load backend activity"
    );
  }

  return data;
}