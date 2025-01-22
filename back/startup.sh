#!/bin/sh

npx prisma generate
npx prisma migrate reset --force
npx prisma studio &
exec npm run dev
