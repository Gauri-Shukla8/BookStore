#!/bin/sh
# wait-for-mysql.sh

set -e
  
host="$1"
shift
cmd="$@"

sleep 120

exec $cmd