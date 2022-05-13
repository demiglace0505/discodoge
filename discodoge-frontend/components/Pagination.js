import React from "react";
import Link from "next/link";
import { PER_PAGE } from "@/config/index";

function Pagination({ page, total }) {
  const lastPage = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* Button to Previous Page */}
      {page > 1 && (
        <Link href={`/events?page=${page - 1}`}>
          <a className="btn-secondary">Prev</a>
        </Link>
      )}

      {/* Button to Next Page */}
      {page < lastPage && (
        <Link href={`/events?page=${page + 1}`}>
          <a className="btn-secondary" style={{ float: "right" }}>
            Next
          </a>
        </Link>
      )}
    </div>
  );
}

export default Pagination;
