import json
import os
import subprocess
import urllib.request
import threading
import shutil
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

from .extensions import NewelleExtension
from .handlers.interfaces.interface import Interface
from .handlers.extra_settings import ExtraSettings
from .utility.system import open_website

class WebUIInterface(Interface):
    """Interface that downloads and serves the Newelle WebUI static files."""

    key = "webui"
    name = "Newelle WebUI"

    _GITHUB_API_URL = "https://api.github.com/repos/FrancescoCaracciolo/Newelle-WebUI/releases/latest"
    _ARCHIVE_NAME = "newelle-webui.tar.gz"

    def __init__(self, settings, path):
        super().__init__(settings, path)
        self._server: HTTPServer | None = None
        self._server_thread: threading.Thread | None = None

    @property
    def _extract_location(self) -> str:
        return os.path.join(self.path, "newelle-webui")

    @property
    def _serve_directory(self) -> str:
        return os.path.join(self._extract_location, "dist")

    def is_installed(self) -> bool:
        """Check if the WebUI files have been downloaded and extracted."""
        return os.path.isdir(self._serve_directory) and os.path.isfile(
            os.path.join(self._serve_directory, "index.html")
        )

    def install(self):
        """Download the latest newelle-webui.tar.gz from GitHub releases and extract it."""
        super().install()
        extract_dir = self._extract_location

        # Clean up any existing extraction
        if os.path.isdir(extract_dir):
            shutil.rmtree(extract_dir)
        os.makedirs(extract_dir, exist_ok=True)

        # Fetch the latest release info from GitHub API
        print(f"[WebUI] Fetching latest release info from {self._GITHUB_API_URL}")
        try:
            req = urllib.request.Request(self._GITHUB_API_URL)
            req.add_header("Accept", "application/vnd.github+json")
            req.add_header("User-Agent", "Newelle-WebUI-Installer")
            with urllib.request.urlopen(req, timeout=30) as response:
                release_data = json.loads(response.read().decode("utf-8"))
        except Exception as e:
            raise RuntimeError(f"Failed to fetch release info: {e}")

        # Find the tarball asset
        download_url = None
        for asset in release_data.get("assets", []):
            if asset.get("name") == self._ARCHIVE_NAME:
                download_url = asset.get("browser_download_url")
                break

        if download_url is None:
            raise RuntimeError(
                f"Could not find {self._ARCHIVE_NAME} in the latest release assets"
            )

        print(f"[WebUI] Downloading from {download_url}")
        archive_path = os.path.join(extract_dir, self._ARCHIVE_NAME)

        # Download the tarball
        try:
            urllib.request.urlretrieve(download_url, archive_path)
        except Exception as e:
            raise RuntimeError(f"Failed to download archive: {e}")

        # Extract the tarball
        print(f"[WebUI] Extracting to {extract_dir}")
        try:
            subprocess.run(
                ["tar", "xvf", archive_path, "-C", extract_dir],
                check=True,
            )
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Failed to extract archive: {e}")

        # Clean up the archive
        try:
            os.remove(archive_path)
        except OSError:
            pass

        print(f"[WebUI] Installation complete. Files extracted to {extract_dir}")

    def get_extra_settings(self) -> list:
        return [
            ExtraSettings.SpinSetting(
                key="port",
                title="Port",
                description="Port to serve the WebUI on",
                default=6688,
                min=1,
                max=65535,
                step=1,
            ),
            ExtraSettings.ButtonSetting("open", "Open in Browser", "Open Newelle WebUI in browser" , lambda x : self._open_in_browser(), "Open"),
        ]

    def _open_in_browser(self):
        open_website("http://localhost:" + str(self._get_port()))

    def _get_port(self) -> int:
        return self.get_setting("port", search_default=True, return_value=8080)

    def start(self):
        if not self.is_installed():
            print("[WebUI] Cannot start: WebUI files are not installed. Run install() first.")
            return

        if self._is_locally_running():
            print("[WebUI] Server is already running.")
            return

        serve_dir = self._serve_directory
        port = self._get_port()

        # Create a handler class bound to the serve directory
        directory = serve_dir

        class _BoundHandler(SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=directory, **kwargs)

            def log_message(self, format, *args):
                print(f"[WebUI] {args[0]}")

        try:
            self._server = HTTPServer(("0.0.0.0", port), _BoundHandler)
        except socket.error as e:
            print(f"[WebUI] Failed to bind to port {port}: {e}")
            self._server = None
            return

        self._server_thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        self._server_thread.start()
        self._write_state_file()
        print(f"[WebUI] Server started on http://0.0.0.0:{port}")

    def stop(self):
        self._clear_state_file()
        if self._server is not None:
            self._server.shutdown()
            self._server.server_close()
            self._server = None
            self._server_thread = None
            print("[WebUI] Server stopped")

    def _is_locally_running(self) -> bool:
        return self._server is not None and self._server_thread is not None and self._server_thread.is_alive()


class WebUIExtension(NewelleExtension):
    """Extension that provides the Newelle WebUI interface."""

    name = "Newelle WebUI"
    id = "newellewebui"

    def get_interface_handlers(self) -> list[dict]:
        return [
            {
                "key": "webui",
                "title": "Newelle WebUI",
                "description": "Download and serve the Newelle WebUI as a local web interface",
                "class": WebUIInterface,
            }
        ]
