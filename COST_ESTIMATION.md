# Server Cost Estimation for Dynamic QR Generator

## Business Model
- **Clients:** 1,000 businesses
- **Subscription:** ₹999/year per client
- **Revenue:** ₹9,99,000/year (≈$12,000/year)
- **Traffic per client:** 72,000 scans/year
- **Total annual scans:** 72,000 × 1,000 = **72,000,000 scans/year**
- **Monthly scans:** ~6,000,000 scans/month

## Infrastructure Stack
- **Hosting:** Vercel (Serverless)
- **Database:** MongoDB Atlas
- **Code Repository:** GitHub (Free)
- **Development:** Cursor IDE

---

## Cost Breakdown

### 1. Vercel Hosting (Serverless Functions)

**Vercel Pro Plan:** $20/month
- **Included:** 1,000 GB-hours compute time
- **Additional compute:** $0.00036 per GB-second
- **Bandwidth:** 1TB included, then $0.10/GB

**Estimated Usage:**
- Each QR scan = 1 serverless function invocation (~100ms, 512MB)
- 6M scans/month = 6M invocations
- Compute: 6M × 0.1s × 0.5GB = 300,000 GB-seconds = 83.3 GB-hours
- **Within free tier** ✅

**Bandwidth:**
- Each page load: ~50KB (HTML + assets)
- 6M scans × 50KB = 300GB/month
- **Within 1TB limit** ✅

**Vercel Cost: $20/month = ₹1,680/month = ₹20,160/year**

---

### 2. MongoDB Atlas Database

**Recommended:** M10 Cluster (Production)
- **Specs:** 2GB RAM, 10GB storage, 3-node replica set
- **Cost:** ~$57/month = ₹4,788/month = ₹57,456/year

**Storage Calculation:**
- User data: ~5KB per user (1,000 users) = 5MB
- Links: ~2KB per link (avg 5 links/user) = 10MB
- QR codes (base64): ~50KB per QR = 50MB
- Sessions: ~1KB per active session = ~10MB
- **Total:** ~75MB (well within 10GB) ✅

**Read/Write Operations:**
- Reads: 6M scans/month = 6M reads
- Writes: ~10K/month (user updates, link changes)
- M10 handles: 10,000 ops/second
- **Well within limits** ✅

**Alternative (M5 for start):** $25/month = ₹2,100/month = ₹25,200/year
- Can upgrade to M10 when needed

---

### 3. Domain & DNS
- **Domain:** ₹500-1,000/year (one-time or annual)
- **DNS:** Included with Vercel

---

## Total Annual Cost Estimate

| Service | Monthly | Annual |
|---------|---------|--------|
| Vercel Pro | ₹1,680 | ₹20,160 |
| MongoDB M10 | ₹4,788 | ₹57,456 |
| MongoDB M5 (start) | ₹2,100 | ₹25,200 |
| Domain | - | ₹1,000 |
| **Total (M10)** | **₹6,468** | **₹78,616** |
| **Total (M5)** | **₹3,780** | **₹46,360** |

---

## Revenue vs Cost Analysis

**Annual Revenue:** ₹9,99,000
**Annual Cost (M10):** ₹78,616
**Annual Cost (M5):** ₹46,360

**Profit Margin:**
- With M10: **92.1%** (₹9,20,384 profit)
- With M5: **95.4%** (₹9,52,640 profit)

**Recommendation:** Start with **M5 cluster** (₹25,200/year), upgrade to M10 when you reach 500+ active clients.

---

## Scaling Considerations

### At 2,000 Clients (144M scans/year):
- Vercel: Still $20/month (within limits)
- MongoDB: Upgrade to M20 (~$120/month)
- **Total:** ~₹1,20,000/year
- **Revenue:** ₹19,98,000/year
- **Profit:** ₹18,78,000/year (94% margin)

### At 5,000 Clients (360M scans/year):
- Vercel: May need Enterprise (contact for pricing)
- MongoDB: M30 or M40 cluster (~$200-300/month)
- **Total:** ~₹3,00,000/year
- **Revenue:** ₹49,95,000/year
- **Profit:** ₹46,95,000/year (94% margin)

---

## Cost Optimization Tips

1. **Start with M5:** Upgrade only when needed
2. **CDN Caching:** Vercel automatically caches static assets
3. **Database Indexing:** Ensure proper indexes for fast queries
4. **Rate Limiting:** Prevent abuse and reduce unnecessary requests
5. **Image Optimization:** Compress logos/icons before storing (base64)

---

## Conclusion

**For 1,000 clients:**
- **Recommended Setup:** Vercel Pro + MongoDB M5
- **Annual Cost:** ~₹46,360
- **Profit Margin:** 95.4%
- **Very sustainable and profitable!** ✅

