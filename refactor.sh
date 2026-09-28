#!/bin/bash

FILE="app/customer/page.tsx"

# Change the main wrapper in all views
sed -i 's/w-full max-w-\[400px\] h-\[800px\] bg-zinc-950 rounded-\[40px\]/w-full max-w-7xl min-h-screen md:min-h-[800px] bg-zinc-950 md:rounded-3xl/g' $FILE

# Fix the Home view restaurant list
# From: <div className="space-y-4">
# To:   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
sed -i 's/<div className="space-y-4">/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/g' $FILE

# Fix the Restaurant view header
# From: <div className="h-44 bg-gradient-to-br from-purple-900/40 to-black relative flex items-end px-6 pb-5">
# To:   <div className="h-64 bg-gradient-to-br from-purple-900/40 to-black relative flex items-end px-10 pb-8 md:rounded-t-3xl">
sed -i 's/className="h-44 bg-gradient-to-br/className="h-64 bg-gradient-to-br/g' $FILE

# Fix the Auth page to also have desktop styling
AUTH_FILE="app/auth/page.tsx"
# It's already flex items-center justify-center p-6 with max-w-md. That looks fine on desktop (like a login card).
