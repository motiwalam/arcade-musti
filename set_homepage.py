#!/usr/bin/env python

import json

def main(argv):
    with open('./package.json', 'r+') as f:
        package = json.loads(f.read())
        package["homepage"] = argv[1]
        f.seek(0)
        f.write(json.dumps(package, indent=4))

if __name__ == "__main__":
    import sys
    raise SystemExit(main(sys.argv))