use std::num::NonZeroUsize;
use std::{collections::HashMap, process};

use radicle::prelude::RepoId;
use radicle::version::Version;
use radicle_httpd as httpd;

pub const VERSION: Version = Version {
    name: "radicle-httpd",
    commit: env!("GIT_HEAD"),
    version: env!("RADICLE_VERSION"),
    timestamp: env!("SOURCE_DATE_EPOCH"),
};

pub const HELP_MSG: &str = r#"
Usage

   radicle-httpd [<option>...]
   
Options

    --listen       <address>         Address to listen on (default: 0.0.0.0:8080)
    --alias, -a    <alias> <rid>     Provide alias and RID pairs to shorten git clone commands for repositories,
                                     e.g. heartwood and rad:z3gqcJUoA1n9HaHKufZs5FCSGazv5 to produce https://seed.radicle.xyz/heartwood.git
    --cache        <number>          Max amount of items in cache for /tree endpoints (default: 100)
    --version, -v                    Print program version
    --help, -h                       Print help
"#;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let options = parse_options()?;

    // SAFETY: The logger is only initialized once.
    httpd::logger::init().unwrap();
    tracing::info!("starting http daemon..");
    tracing::info!("version {} ({})", env!("RADICLE_VERSION"), env!("GIT_HEAD"));

    match httpd::run(options).await {
        Ok(()) => {}
        Err(err) => {
            tracing::error!("Fatal: {:#}", err);
            process::exit(1);
        }
    }
    Ok(())
}

/// Parse command-line arguments into HTTP options.
fn parse_options() -> Result<httpd::Options, lexopt::Error> {
    use lexopt::prelude::*;

    let mut parser = lexopt::Parser::from_env();
    let mut listen = None;
    let mut aliases = HashMap::new();
    let mut cache = Some(httpd::DEFAULT_CACHE_SIZE);

    while let Some(arg) = parser.next()? {
        match arg {
            Long("listen") => {
                let addr = parser.value()?.parse()?;
                listen = Some(addr);
            }
            Long("alias") | Short('a') => {
                let alias: String = parser.value()?.parse()?;
                let id: RepoId = parser.value()?.parse()?;

                aliases.insert(alias, id);
            }
            Long("version") | Short('v') => {
                if let Err(e) = VERSION.write(std::io::stdout()) {
                    eprintln!("error: {e}");
                    process::exit(1);
                };
                process::exit(0);
            }
            Long("cache") => {
                let size = parser.value()?.parse()?;
                cache = NonZeroUsize::new(size);
            }
            Long("help") | Short('h') => {
                println!("{HELP_MSG}");
                process::exit(0);
            }
            _ => return Err(arg.unexpected()),
        }
    }
    Ok(httpd::Options {
        aliases,
        listen: listen.unwrap_or_else(|| ([0, 0, 0, 0], 8080).into()),
        cache,
    })
}
