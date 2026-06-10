

--exclude .git/
--exclude node_modules/
--exclude target/
--exclude dist/
--exclude .next/
--exclude build/
--exclude .cache/
--exclude coverage/
--exclude package-lock.json
--exclude pnpm-lock.yaml
--exclude yarn.lock
--exclude Cargo.lock
--exclude .venv/
--exclude uv.lock
--exclude __pycache__/
--exclude vendor/
--exclude go.sum



set -l exclude_list
for glob in _flag_exclude
    set -la exclude_list
end

function
    set -l gitdir (git rev-parse --absolute-git-dir 2> /dev/null)
    or return 1
    set -l gitroot (dirname "$gitdir")

    # Read 
    if test -f .gitignore
    for line in (cat .gitignore)
        string match -q -r '^\s*(#|$)' "$line"
        and continue
        set -l pattern (string trim $line | string trim -r -c /)
        set -a exclude_args --exclude="$pattern" --exclude-dir="$pattern"
    end
end
end

grep "TODO" --exclude=$_flag_exclude -I -r .

git status --short

