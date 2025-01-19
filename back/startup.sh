#!/bin/sh

npx prisma migrate reset --force
npx prisma studio &
exec npm run dev
