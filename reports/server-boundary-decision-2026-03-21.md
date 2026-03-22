# Server Boundary Decision - 2026-03-21

## Keep Client-Visible For Now

These are product-surface inputs rather than protected interpretation IP:

- subject list
- theme list
- spread options
- UI theme options
- basic card and house labels needed to render the spread itself

Reason:

- they shape setup UX
- they are not the core interpretation advantage
- keeping them client-side keeps setup fast and simple

## Move Server-Side

These are part of the interpretation engine or should be treated that way:

- reading composition
- subject/theme synthesis logic
- school-specific interpretation rules
- pair/cluster/house narrative builders
- card inspector narrative detail

Reason:

- this is the proprietary reading behavior
- this is where future school differences will live
- this is the highest-value IP to avoid shipping to the browser

## Practical Next Layer

1. keep setup taxonomy client-visible
2. move more interpretation-detail routes behind API boundaries
3. add server-side caching / throttling / logs around reading generation
4. only revisit server-driven setup if:
   - schools become dynamic per account
   - pricing/gating is added
   - setup options themselves become proprietary
