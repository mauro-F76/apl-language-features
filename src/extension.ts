'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        {language: "atoolsoftwareapl"}, new APLDocumentSymbolProvider()
    ));
}

class APLDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument,
        token: vscode.CancellationToken): Thenable<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            var symbols: vscode.DocumentSymbol[] = [];

            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);

                var SectionRegExp = /^(\s*)(###section )/;
                var SectionEndRegExp = /^(\s*)(###endsection )/;
                var FunctionRegExp = /^(\s*)(\~START )/;
                var FunctionEndRegExp = /^(\s*)(\~END\b)/;

                var VarAssignRegExp = /^(\s*)(\~LET \[)/;
                var StringOutputRegExp = /^(\s*)(\~\?)/;

                // start ###section
                if (line.text.match(SectionRegExp)) {
                    let sname = line.text.substr(11);
                    sname = sname.toString().trim();
                    let detail = "";
                    let start_pos = new vscode.Position(i, 0);
                    let end_pos = new vscode.Position(i, 0);
                    let i_char = 0;
                    
                    let ds = new vscode.DocumentSymbol(sname, detail, vscode.SymbolKind.Class, line.range, line.range);

                    // console.log("found section (1)...");

                    // search functions within section
                    for (var i_line = i; i_line < document.lineCount; i_line++) {
                        let section_line = document.lineAt(i_line);
                        let mtxt = section_line.text;

                        // console.log("process section: " + mtxt);
                        i_char = mtxt.length;

                        if (mtxt.match(FunctionRegExp)) {
                            let mname = mtxt.substr(0);
                            mname = mname.toString().trim();
                            let m_details = "";
                            let f_start_pos = new vscode.Position(i, 0);
                            let fs = new vscode.DocumentSymbol(mname, m_details, vscode.SymbolKind.Function, section_line.range, section_line.range);

                            // search variable assignments and pcs output
                            for(var f_line = i_line; f_line < document.lineCount; f_line++) {
                                let function_line = document.lineAt(f_line);
                                let ftxt = function_line.text;
                                
                                i_char = ftxt.length; 
                                // console.log("enter function (3)...");
                                
                                if (ftxt.match(VarAssignRegExp)) {
                                    let vname = ftxt.substr(0);
                                    vname = vname.toString().trim();
                                    let f_details = "";
                                    let vs = new vscode.DocumentSymbol(vname, f_details, vscode.SymbolKind.Variable, function_line.range, function_line.range);

                                    // console.log("found variable assignment (4) ...");
                                    fs.children.push(vs);
                                } else if (ftxt.match(StringOutputRegExp)) {
                                    let vname = ftxt.substr(0);
                                    vname = vname.toString().trim();
                                    let f_details = "";
                                    let vs = new vscode.DocumentSymbol(vname, f_details, vscode.SymbolKind.String, function_line.range, function_line.range);

                                    // console.log("found pcs output (5) ...");
                                    fs.children.push(vs);
                                }

                                if (ftxt.match(FunctionEndRegExp)) {
                                    // console.log("exit (1)...");
                                    i = f_line;
                                    break;
                                }
                            }

                            let f_end_pos = new vscode.Position(i, i_char);
                            let fs_rng = new vscode.Range(f_start_pos, f_end_pos);
                            fs.range = fs_rng;
                            ds.children.push(fs);
                        }

                        if (mtxt.match(SectionEndRegExp)) {
                            // console.log("exit (2)...");
                            i = i_line;
                            end_pos = new vscode.Position(i, i_char);
                            break;
                        }
                    }

                    // let end_pos = new vscode.Position(i, i_char);
                    let rng = new vscode.Range(start_pos, end_pos);
                    ds.range = rng;

                    symbols.push(ds);
                } else if (line.text.match(FunctionRegExp)) {
                    // function when no section has been declared
                    let mname = line.text.substr(0);
                    mname = mname.toString().trim();
                    let m_details = "";
                    let i_char = 0;
                    let f_start_pos = new vscode.Position(i, 0);
                    let fs = new vscode.DocumentSymbol(mname, m_details, vscode.SymbolKind.Function, line.range, line.range);

                    // search variable assignments and pcs output
                    for(let i_line = i; i_line < document.lineCount; i_line++) {
                        let function_line = document.lineAt(i_line);
                        let ftxt = function_line.text;
                        i_char = ftxt.length;

                        if (ftxt.match(VarAssignRegExp)) {
                            let vname = ftxt.substr(0);
                            vname = vname.toString().trim();
                            let f_details = "";
                            let vs = new vscode.DocumentSymbol(vname, f_details, vscode.SymbolKind.Variable, function_line.range, function_line.range);

                            // console.log("found variable assignment (4) ...");
                            fs.children.push(vs);
                        } else if (ftxt.match(StringOutputRegExp)) {
                            let vname = ftxt.substr(0);
                            vname = vname.toString().trim();
                            let f_details = "";
                            let vs = new vscode.DocumentSymbol(vname, f_details, vscode.SymbolKind.String, function_line.range, function_line.range);

                            // console.log("found pcs output (5) ...");
                            fs.children.push(vs);
                        }

                        if (ftxt.match(FunctionEndRegExp)) {
                            // console.log("exit (1)...");
                            i = i_line;
                            break;
                        }
                    }

                    let f_end_pos = new vscode.Position(i, i_char);
                    let fs_rng = new vscode.Range(f_start_pos, f_end_pos);
                    fs.range = fs_rng;

                    symbols.push(fs);
                }

            } 

            resolve(symbols);
        });
    }
}


