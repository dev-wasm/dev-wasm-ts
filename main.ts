import { Console, FileSystem } from "as-wasi/assembly";

Console.log("Hello TS World!");

var f = FileSystem.open("test.txt", "w");
f!.writeString("this is a test\n");
f!.close();

Console.log("Wrote file");

f = FileSystem.open("test.txt", "r");
var line = f!.readLine();
f!.close();

if (line) {
    var f2 = FileSystem.open("test-2.txt", "w");
    f2!.writeStringLn(line!);
    f2!.close();
    Console.log("Copied file");
} else {
    Console.log("Failed to read file");
}
