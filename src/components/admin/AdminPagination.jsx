import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * AdminPagination Component
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when a page is clicked
 * @param {number} totalItems - Total results count
 * @param {number} limit - Items per page
 */
export default function AdminPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  limit 
}) {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * limit + 1;
  const endIdx = Math.min(currentPage * limit, totalItems);

  // Helper to generate page sequence
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="admin-pagination" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--space-4) 0',
      marginTop: 'var(--space-6)',
      borderTop: '1px solid var(--border-light)',
      flexWrap: 'wrap',
      gap: 'var(--space-4)'
    }}>
      <div style={{ 
        fontSize: 'var(--fs-14)', 
        color: 'var(--text-muted)' 
      }}>
        Showing <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{startIdx}</span> to <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{endIdx}</span> of <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{totalItems}</span> results
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-2)' 
      }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-light)',
            background: 'var(--surface)',
            color: 'var(--text-dark)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span style={{ padding: '0 var(--space-1)', color: 'var(--text-muted)' }}>...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid',
                  borderColor: currentPage === page ? 'var(--primary)' : 'var(--border-light)',
                  background: currentPage === page ? 'var(--primary)' : 'var(--surface)',
                  color: currentPage === page ? 'var(--surface-white)' : 'var(--text-dark)',
                  fontSize: 'var(--fs-14)',
                  fontWeight: currentPage === page ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-light)',
            background: 'var(--surface)',
            color: 'var(--text-dark)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
