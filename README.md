<div align="center">
  <img src="assets/koko.svg" alt="Koko icon" width="256" />
  <h1 align="center">Koko website</h1>
  <h4 align="center">The Koko product page at <a href="https://koko.lizardbyte.dev/">koko.lizardbyte.dev</a>.</h4>
</div>

<div align="center">
  <a href="https://sonarcloud.io/project/overview?id=KokoStreamTV_KokoStreamTV.github.io"><img src="https://img.shields.io/sonar/quality_gate/KokoStreamTV_KokoStreamTV.github.io.svg?server=https%3A%2F%2Fsonarcloud.io&amp;style=for-the-badge&amp;logo=sonarqubecloud&amp;label=sonarcloud" alt="SonarCloud"></a>
</div>

GitHub Pages publishes `master` from the repository root. This is a static HTML, CSS, and JavaScript site with
no build step or runtime dependencies. Keep `.nojekyll` and `CNAME` at the repository root.

## Development

Serve the repository with a local static web server, such as `python -m http.server 8000`, then visit
`http://localhost:8000/`. Run the theme and content checks with `npm test` (Node.js 24 or newer).

The theme follows the device preference until the visitor selects a light or dark mode. The selection is
stored locally when storage is available and still works for the current page when storage is blocked.
Navigation, project links, documentation, and donations work without JavaScript.

Koko is in early development. Keep the website's project status and capability descriptions consistent with
[Koko](https://github.com/KokoStreamTV/Koko). The media illustration is original artwork, not an application demo.

## Hosting

The custom domain is `koko.lizardbyte.dev`, with its CNAME pointing to `kokostreamtv.github.io`.
Enable HTTPS enforcement after GitHub provisions the certificate. This organization website owns the hostname;
project Pages sites can inherit it at their repository paths without setting another custom domain.

## Assets and licensing

The original website code and illustration use [AGPL-3.0-only](LICENSE). Source is linked in the website footer.
See [ASSETS.md](ASSETS.md) for the existing logo and font terms. Koko's application license is unchanged.
