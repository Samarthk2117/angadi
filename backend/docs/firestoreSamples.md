# Firestore Sample Document Structures

These are sample shapes only. They do not overwrite existing collections or data.

## `reports` collection (sample document)

```json
{
  "title": "Urgent bank KYC verification",
  "description": "User received a suspicious SMS asking to verify account details.",
  "category": "phishing",
  "status": "open",
  "isSpam": false,
  "fingerprint": "phishing|urgent-bank-kyc-verification|+911234567890",
  "reportedBy": "user_123",
  "createdAt": "Firestore Timestamp",
  "expiresAt": "Firestore Timestamp"
}
```

## `alerts` collection (sample document)

```json
{
  "title": "Trending phishing",
  "message": "12 reports indicate a rise in phishing activity.",
  "category": "phishing",
  "severity": "high",
  "reportCount": 12,
  "source": "cron-6h-trend-monitor",
  "status": "active",
  "createdAt": "Firestore Timestamp"
}
```

## `analytics` collection (sample document)

```json
{
  "totalReports": 142,
  "mostReportedScamType": "phishing",
  "mostReportedScamTypeCount": 57,
  "highRiskCategories": [
    { "category": "phishing", "count": 57 },
    { "category": "otp_fraud", "count": 24 }
  ],
  "categoryBreakdown": [
    { "category": "phishing", "count": 57 },
    { "category": "otp_fraud", "count": 24 },
    { "category": "fake_links", "count": 18 }
  ],
  "generatedAt": "Firestore Timestamp",
  "source": "cron-weekly-analytics"
}
```

