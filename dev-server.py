import http.server
import socketserver
import urllib.request

PORT = 8080

class MyProxy(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path[0:5] == '/api/':
            print(self.path)
            self.send_response(200)            
            with urllib.request.urlopen('http://localhost:8081' + self.path) as url:
                self.headers = url.getheaders()                
                self.end_headers()
                self.copyfile(url, self.wfile) 
        else:
            return super().do_GET()


with socketserver.TCPServer(("", PORT), MyProxy) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
