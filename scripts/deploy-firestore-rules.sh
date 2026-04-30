#!/bin/bash
# Run: bash scripts/deploy-firestore-rules.sh
# Requires: firebase login (run once manually)

echo "Deploying Firestore security rules..."
firebase use tinnitusoff-e61c4
firebase deploy --only firestore:rules,firestore:indexes
echo "Done! Rules are live."
