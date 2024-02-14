import { readFile } from "fs/promises";

export default (conditions = []) => {
    return {
        name: "conditional-compile",
        setup(build) {
            build.onLoad({ filter: /\.[tj]sx?$/g, namespace: "file" }, async args => {
                var file = await readFile(args.path, "utf8");

                if (!file.startsWith("//#conditional")) return;

                var lines = file.split("\n");

                var statements = [];
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();

                    if (line.startsWith("//#if")) {
                        var condition = line.substring(5).trim();
                        var invert = false;
                    
                        if (condition.startsWith("!")) {
                            condition = condition.substring(1).trim();
                            invert = true;
                        }

                        statements.push({
                            condition: condition,
                            invert: invert,
                            start: i,
                            else: false,
                            elsePos: -1
                        });
                    }
                    else if (line.startsWith("//#else")) {
                        var last = statements[statements.length - 1];

                        if (!last || last.else) {
                            throw new Error(`Unexpected else statement at line ${i + 1}`);
                        }

                        last.else = true;
                        last.elsePos = i;

                        statements[statements.length - 1] = last;
                    }
                    else if (line.startsWith("//#endif")) {
                        var statement = statements.pop();

                        if (!statement) throw new Error(`Unexpected endif at line ${i + 1}`);
                        
                        var isTrue = conditions.includes(statement.condition);

                        if (statement.invert) isTrue = !isTrue;

                        if (isTrue) {
                            lines.splice(i, 1);

                            if (statement.else) {
                                lines.splice(statement.elsePos, i - statement.elsePos);
                                i = statement.elsePos;
                            }

                            lines.splice(statement.start, 1);

                            i -= 2;
                        }
                        else {
                            if (statement.else) {
                                lines.splice(i, 1);
                                lines.splice(statement.start, statement.elsePos - statement.start + 1);
                                i -= statement.elsePos - statement.start + 1;
                            }
                            else {
                                lines.splice(statement.start, i - statement.start + 1);
                                i = statement.start - 1;
                            }
                        }
                    }
                }

                if (statements.length > 0) {
                    if (statements.length == 1)
                        throw new Error(`Unclosed conditional statement at line ${statements[0].start + 1}`);
                    else if (statements.length == 2) {
                        throw new Error(`Unclosed conditional statement at lines ${statements[0].start + 1} and ${statements[1].start + 1}`);
                    }
                    else {
                        var text = "Unclosed conditional statements at lines ";
                        for (var i = 0; i < statements.length - 1; i++) {
                            text += `${statements[i].start + 1}, `;
                        }

                        text += `and ${statements[statements.length - 1].start + 1}`;

                        throw new Error(text);
                    }
                }

                return {
                    contents: lines.join("\n"),
                    loader: args.path.split(".").pop()
                };
            });
        }
    }
};
