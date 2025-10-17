# Process Email Data Node Configuration

## What This Node Does

The "Process Email Data" node is a **Set** node that extracts and organizes email fields before sending them to the Code node for API formatting.

## Configuration Steps

### 1. Open the Node in n8n

1. Click on the **"Process Email Data"** node
2. You'll see it's a "Set" node (version 3)

### 2. Configure Fields to Keep

Click **"Add Field"** and add these mappings:

| Field Name | Type | Value (Expression) |
|------------|------|-------------------|
| `from` | String | `{{ $json.from.value[0].address }}` |
| `fromName` | String | `{{ $json.from.value[0].name }}` |
| `subject` | String | `{{ $json.subject }}` |
| `text` | String | `{{ $json.text }}` |
| `html` | String | `{{ $json.html }}` |
| `messageId` | String | `{{ $json.messageId }}` |
| `to` | String | `{{ $json.to }}` |
| `cc` | String | `{{ $json.cc }}` |
| `date` | String | `{{ $json.date }}` |

### 3. Settings

- **Mode**: Keep Only Set Fields
- **Options**: Leave as default

### 4. Save

Click the checkmark or "Save" button

## Alternative: Simplify the Workflow

Since the "Format API Payload" Code node handles all the data extraction, you can **skip** the "Process Email Data" node entirely:

### Option A: Delete the Node

1. Click on "Process Email Data" node
2. Press `Delete` key
3. Connect "Email Trigger" directly to "Format API Payload"
4. Save workflow

### Option B: Use Pass-Through Mode

1. Click on "Process Email Data" node
2. Set **Mode** to "Manual Mapping"
3. Don't add any fields (it will pass everything through)
4. Save

## Recommended Approach

**Use Option A (Delete the node)** because:
- The Code node already handles all data extraction
- Simpler workflow = easier to debug
- One less node to maintain

## If You Keep It

If you want to keep the Set node for organization, here's the complete configuration:

```json
{
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "id": "1",
          "name": "from",
          "value": "={{ $json.from.value?.[0]?.address || $json.from?.address || '' }}",
          "type": "string"
        },
        {
          "id": "2",
          "name": "fromName",
          "value": "={{ $json.from.value?.[0]?.name || $json.from?.name || '' }}",
          "type": "string"
        },
        {
          "id": "3",
          "name": "subject",
          "value": "={{ $json.subject || 'No Subject' }}",
          "type": "string"
        },
        {
          "id": "4",
          "name": "text",
          "value": "={{ $json.text || $json.textPlain || '' }}",
          "type": "string"
        },
        {
          "id": "5",
          "name": "html",
          "value": "={{ $json.html || '' }}",
          "type": "string"
        },
        {
          "id": "6",
          "name": "messageId",
          "value": "={{ $json.messageId || $json.id || '' }}",
          "type": "string"
        },
        {
          "id": "7",
          "name": "to",
          "value": "={{ $json.to }}",
          "type": "string"
        },
        {
          "id": "8",
          "name": "cc",
          "value": "={{ $json.cc }}",
          "type": "string"
        },
        {
          "id": "9",
          "name": "date",
          "value": "="{{ $json.date }}",
          "type": "string"
        }
      ]
    }
  }
}
```

## Quick Fix: Just Delete It

The easiest solution:

1. Select "Process Email Data" node
2. Press `Delete`
3. Drag connection from "Email Trigger" to "Format API Payload"
4. Save workflow
5. Done! ✅

The Code node handles everything, so this Set node is redundant.

