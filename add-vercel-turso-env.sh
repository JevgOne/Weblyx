#!/bin/bash
# Add Turso credentials to Vercel environment

echo "TURSO_DATABASE_URL=libsql://titanboxing-jevgone.aws-ap-south-1.turso.io" | npx vercel env add TURSO_DATABASE_URL production --force
echo "TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4MjQzNzUsImlkIjoiNThmNWYxYmItZjFiYS00YmYwLWIwOTItODExNDdjOTRmZTQ5IiwicmlkIjoiYzMwMWFkY2ItYjI0NS00MjY1LTg0YmQtODgyYmUyNjU4NmY0In0.WTtZVte4NmQ360ChSs5DJa2VeC2sMBhEKuP93SuyG3z69thMEBFbNV4udtnc79LbYW-YX9feJ9DLIwD70yiFAA" | npx vercel env add TURSO_AUTH_TOKEN production --force
