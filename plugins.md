## Plugins
Plugins are templates which can be called from articles to add formatting that Markdown doesn't support. Specifically, they're .ejs files that get rendered according to the plugin's call. In text, a plugin call can be made like so:
```
{{plugin-name | param1=value1 | param2=value2}}
```

where the plugin-name is the name of an .ejs file in the plugins directory. The parameters are passed to the .ejs file during render. Parameters are optional - you can have a parameterless plugin call.
When creating or updating an article with plugin calls in the text, any errors will be returned as human-friendly strings in a `pluginErr` value on the returned JSON.

### Making plugins
See [the EJS documentation](ejs.co) for information on how to write an .ejs file. Note that the EJS file will not be notified as to if it has any parameters or not; simply trying to use a parameter may produce unexpected results.