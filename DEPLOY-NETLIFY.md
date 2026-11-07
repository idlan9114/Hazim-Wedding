# Publish Hazim & Shafikah's invitation

GitHub keeps the source code. Netlify builds and hosts the website. Supabase stores the ucapan, and RSVP opens the Google Form.

Repository: **https://github.com/idlan9114/Hazim-Wedding**

## Link GitHub to Netlify

1. Sign in to [Netlify](https://app.netlify.com/).
2. Select **Add new project → Import an existing project**.
3. Select **GitHub** and allow Netlify access to **idlan9114/Hazim-Wedding**.
4. Select **Hazim-Wedding** and the **main** branch.
5. Keep the base directory empty: `package.json` is at the repository root.
6. Confirm these settings. The included `netlify.toml` already supplies them:

   | Setting | Value |
   | --- | --- |
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Node version | `22` |

7. Before publishing, add these **Environment variables** and make them available to **Builds**:

   ```dotenv
   VITE_SUPABASE_URL=copy_the_value_from_your_local_env_file
   VITE_SUPABASE_PUBLISHABLE_KEY=copy_the_value_from_your_local_env_file
   ```

   Copy the values from `.env.local` on your computer. This file stays out of GitHub. Use the publishable key; server secret/service-role keys do not belong in these browser settings.

8. Select **Publish** and wait for the build to complete. If your Netlify project starts private, change its visibility to public when you are ready to share the invitation.
9. Open the returned `.netlify.app` address in a private/incognito window to check guest access.

The Git repository contains the source, images, `package-lock.json`, and Netlify configuration. Netlify installs dependencies and builds `dist` itself. `node_modules`, local tools, verification screenshots, build output, and `.env.local` stay on your computer.

## Check the published invitation

- Confirm the date is **11 Disember 2026** and the venue is **Kuasa Kaseh Kota Masai**.
- Check that Google Maps and the RSVP button open their intended destinations.
- Scroll to ucapan and send a message. Refresh, scroll back to ucapan, and confirm it stays saved.
- Open a second tab and keep ucapan visible in both tabs. New messages should appear live.
- Confirm two cards are visible with independent scrolling for older wishes.

Your Supabase database and SQL setup are already separate from deployment. Publishing or updating the website does not reset existing wishes.

## Remember for future updates

1. Edit and check the project locally.
2. Commit and push the finished changes to `main` on GitHub.
3. Netlify automatically builds and deploys the updated website.

For experiments, use a branch/pull request and a Netlify Deploy Preview before merging to `main`. On current credit-based plans, preview deployments have no deployment-credit charge; their traffic still counts. Production deployments use credits.

Changing a `VITE_` environment variable in Netlify requires a fresh build/deploy. New guest ucapan are saved directly to Supabase and require no deployment.

If a build fails, open **Deploys → the failed deploy → deploy log** in Netlify. Start by checking the build command, `dist` publish directory, Node version, and environment variable names.

## Reference

- [Netlify: deploy from a repository](https://docs.netlify.com/start/quickstarts/deploy-from-repository/)
- [Netlify: Vite setup](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Supabase connection guide in this repository](docs/supabase-netlify-setup.md)
