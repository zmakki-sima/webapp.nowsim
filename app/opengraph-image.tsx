import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/**
 * The image every shared nowsim link renders with. Next wires it into both
 * `og:image` and `twitter:image` (the root metadata sets `summary_large_image`),
 * and emits the type and dimensions alongside it.
 *
 * Composed here rather than shipped as a flat file so the copy and the brand
 * colours stay in step with the site. The wordmark is the real
 * `public/brand/nowsim-logo.png`, inlined as a data URI — the renderer has no
 * origin to resolve a relative path against, and redrawing the mark with divs
 * cannot reproduce its diagonal.
 *
 * Deliberately no custom font. `next/og` accepts only ttf/otf/woff and the
 * project's Satoshi and Figtree are both woff2, so loading them would fail at
 * build time. The default face is close enough for a share card; converting a
 * font to ttf just for this would add a binary to maintain.
 */

export const alt =
  "nowsim — travel eSIMs for every destination. Pick a country, buy a data plan, and connect the moment you land.";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

const BRAND = "#5f47eb";
const INK = "#0a2233";

export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/brand/nowsim-logo.png"),
  );
  const wordmark = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 80,
        }}
      >
        {/* A band of brand colour down the left edge, echoing the site's
            accent without competing with the wordmark. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 24,
            height: "100%",
            background: BRAND,
          }}
        />

        {/* The wordmark already contains both the mark and the name, so
            nothing is set in type beside it. 933×154 scaled to a third. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={wordmark} width={311} height={51} alt="nowsim" />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: INK,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Stay connected, wherever&rsquo;s next
          </div>

          <div
            style={{
              fontSize: 34,
              color: "#5a6b78",
              lineHeight: 1.35,
              maxWidth: 860,
            }}
          >
            Travel eSIMs for every destination. Pick a country, buy a data plan,
            and connect the moment you land.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
