#!/bin/bash
# publish.sh — push your locally published blog posts to the live site.
# Usage:
#   ./publish              auto message
#   ./publish "message"    custom message

set -e
cd "$(dirname "$0")"

if ! git diff --quiet -- data/blogs.json; then
  if [ -n "$1" ]; then
    message="$1"
  else
    message="Update blog content"
  fi
  git add data/blogs.json
  git commit -m "$message"
  git push
  echo ""
  echo "Pushed. Vercel is deploying — live in about a minute:"
  echo "https://pooja-shah-portfolio.vercel.app/blogs"
else
  echo "Nothing to publish — no new posts since the last push."
fi
