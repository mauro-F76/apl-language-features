'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        {language: "atoolsoftwareapl"}, new APLDocumentSymbolProvider()
    ));
}

class APLDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument,
            token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            var symbols = [];
            var SectionRegExp = /^(\s*)(###section )/;
            var FunctionRegExp = /^(\s*)(\~START )/;
            var VarAssignRegExp = /^(\s*)(\~LET \[)/;
            var StringOutputRegExp = /^(\s*)(\~\?)/;
            var tmp;                     

            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);

                // start section
                if (line.text.match(SectionRegExp)) {
                    tmp = line.text.substr(3),
                    tmp = tmp.toString().trim(),
                    symbols.push({
                        name: tmp,
                        kind: vscode.SymbolKind.File,
                        location: new vscode.Location(document.uri, line.range),
                        containerName: "undefined"
                    });
                }
                // subroutine definition
                else if (line.text.match(FunctionRegExp)) {
                    tmp = line.text.substr(0),
                    tmp = tmp.toString().trim(),
                    symbols.push({
                        name: tmp,
                        kind: vscode.SymbolKind.Function,
                        location: new vscode.Location(document.uri, line.range),
                        containerName: "undefined"
                    });
                }
                // variable assignment
                else if (line.text.match(VarAssignRegExp)) {
                    tmp = line.text.substr(0),
                    tmp = tmp.toString().trim(),
                    symbols.push({
                        name: '    ' + tmp,
                        kind: vscode.SymbolKind.Variable,
                        location: new vscode.Location(document.uri, line.range),
                        containerName: "undefined"
                    });
                }
                // text output
                else if (line.text.match(StringOutputRegExp)) {
                    tmp = line.text.substr(0),
                    tmp = tmp.toString().trim(),
                    symbols.push({
                        name: '    ' + tmp,
                        kind: vscode.SymbolKind.String,
                        location: new vscode.Location(document.uri, line.range),
                        containerName: "undefined"
                    });
                }
            }
            resolve(symbols);
        });
    }
}


