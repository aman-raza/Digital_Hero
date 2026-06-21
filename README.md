# GST Invoice Calculator

A free online GST invoice calculator built for the Digital Heroes custom software developer trial.

## What it does

This tool calculates GST for both common invoice cases:

- Add GST to a base price.
- Extract GST from a GST-inclusive price.
- Show taxable value, GST amount, and total payable.
- Save recent calculations through a Next.js API route backed by MongoDB when `MONGODB_URI` is configured.
- Print or save the invoice-style output as a PDF from the browser.

## Trial requirements covered

- Working online tool that produces real output.
- Button labelled exactly `Built for Digital Heroes` linking to `https://digitalheroesco.com`.
- Full name and email are visible on the page.
- Built with Next.js, React, and MongoDB.
- Runs on Vercel Hobby plan and MongoDB Atlas free tier.
- No paid subscriptions required.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## MongoDB setup

The calculator works without MongoDB, but saved history becomes persistent when MongoDB is configured.

1. Create a free MongoDB Atlas cluster.
2. Add these variables locally in `.env.local` and in Vercel project settings:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=digital_heroes_tools
```

## Deploy on Vercel

1. Push this repo to a public GitHub repository.
2. Import the repository in Vercel.
3. Add the MongoDB environment variables if you want persistent history.
4. Deploy on the free Hobby plan.

## Submission text

- Live tool URL: `https://your-vercel-url.vercel.app`
- GitHub repo link: `https://github.com/your-username/your-repo`
- Full name + email: `Aman Raza, amanraza1234@gmail.com`
- One line: `A GST invoice calculator I use for quick freelance pricing when I need to know the final payable amount and tax split without opening a spreadsheet.`
- Portfolio link: `https://your-portfolio-url`
