import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MAX_PAGE_SIZE = 1000;

const Pagination = ({ count, page, pageSize, onPageChange, onPageSizeChange }) => {
  const [pageSizeInput, setPageSizeInput] = useState(String(pageSize));
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const firstItem = count === 0 ? 0 : ((page - 1) * pageSize) + 1;
  const lastItem = Math.min(page * pageSize, count);

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  const commitPageSize = () => {
    const requestedSize = Number(pageSizeInput);
    if (!Number.isInteger(requestedSize) || requestedSize < 1 || requestedSize > MAX_PAGE_SIZE) {
      setPageSizeInput(String(pageSize));
      return;
    }
    if (requestedSize !== pageSize) onPageSizeChange(requestedSize);
  };

  return (
    <div className="pagination">
      <div className="pagination-summary">
        Showing <strong>{firstItem}-{lastItem}</strong> of <strong>{count}</strong>
      </div>
      <div className="pagination-controls">
        <label className="pagination-size-label">
          Rows per page
          <input
            aria-label="Rows per page"
            className="form-input pagination-size-input"
            type="number"
            min="1"
            max={MAX_PAGE_SIZE}
            value={pageSizeInput}
            onChange={(event) => setPageSizeInput(event.target.value)}
            onBlur={commitPageSize}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
        </label>
        <button
          type="button"
          className="btn btn-secondary btn-sm pagination-button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>
        <span className="pagination-page">Page {page} of {pageCount}</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm pagination-button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
