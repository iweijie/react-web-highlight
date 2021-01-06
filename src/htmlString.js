export default `
<pre><code><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">Handler</span>(<span class="hljs-params">onFulfilled, onRejected, promise</span>) </span>{
  <span class="hljs-keyword">this</span>.onFulfilled = <span class="hljs-keyword">typeof</span> onFulfilled === <span class="hljs-string">'function'</span> ? onFulfilled : <span class="hljs-literal">null</span>
  <span class="hljs-keyword">this</span>.onRejected = <span class="hljs-keyword">typeof</span> onRejected === <span class="hljs-string">'function'</span> ? onRejected : <span class="hljs-literal">null</span>
  <span class="hljs-keyword">this</span>.promise = promise
  }</code></pre>`;

`
<div class="RichContent-inner RichContent-inner--collapsed">
<p>
    all 方法当 所有值 resolve 时， Promise 实例才会resolve，
    返回值为数组，并一一对应传入顺序，如一个reject
    ，则当前实例状态变更为 reject
</p>
<p>（雾灯 &amp; 示廓灯 &amp; 危险警示灯 不考）</p>

<p>简单值和 不含then 方法的复杂值 直接作为返回值</p>
<img src="https://mdn.mozillademos.org/files/8633/promises.png" alt="Alt text" title="Promise 流程图" />
<p>promise的状态只会出现从等待状态向执行态或者拒绝态转化，不可以逆转。执行态和拒绝态之间不能相互转换</p>
</div>`;
