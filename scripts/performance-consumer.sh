#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd -P)"
repo_root="$(cd "$script_dir/.." && pwd -P)"

if [[ "${1:-}" == "--check-metafile" ]]; then
  exec node "$script_dir/performance-consumer.mjs" "$@"
fi

: "${PERFORMANCE_CONSUMER_DIR:?PERFORMANCE_CONSUMER_DIR must point outside the repository}"
mkdir -p "$PERFORMANCE_CONSUMER_DIR"
consumer_root="$(cd "$PERFORMANCE_CONSUMER_DIR" && pwd -P)"
case "$consumer_root" in
  "$repo_root"|"$repo_root"/*)
    echo "PERFORMANCE_CONSUMER_DIR must point outside the repository" >&2
    exit 2
    ;;
esac

export HULIAN_PERFORMANCE_REPO_ROOT="$repo_root"
export HULIAN_PERFORMANCE_CONSUMER_ROOT="$consumer_root"
exec node "$script_dir/performance-consumer.mjs" "$@"
